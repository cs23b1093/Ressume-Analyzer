import request from 'supertest';
import app from '../server.js';
import { connect, clearDatabase, closeDatabase } from './tests.setup.js';

const ORIGINAL_ENV = process.env;

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      set: jest.fn().mockResolvedValue('OK'),
      sendCommand: jest.fn(),
    };
  });
});

// Dynamic import mock for pdf-parse: emulate module having default export as function
jest.unstable_mockModule('pdf-parse', () => ({
  default: jest.fn(async (buf) => ({ text: mockedPdfText }))
}));

// Mock for LangChain Google Generative AI
jest.unstable_mockModule('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(async () => ({ content: mockedLlmContent }))
  }))
}));

let mockedPdfText = '';
let mockedLlmContent = '';

beforeAll(async () => {
  // Ensure NODE_ENV test and connect in-memory mongo
  process.env = { ...ORIGINAL_ENV, NODE_ENV: 'test' };
  await connect();
});

afterEach(async () => {
  mockedPdfText = '';
  mockedLlmContent = '';
  delete process.env.GEMINI_API_KEY;
  await clearDatabase();
});

afterAll(async () => {
  process.env = ORIGINAL_ENV;
  await closeDatabase();
});

function makePdf(bufferContent = 'Name: Jane Doe\nEmail: jane@example.com\nPhone: +1 555 123 4567\nSkills: JavaScript, Node.js, React') {
  const buf = Buffer.from(bufferContent, 'utf8');
  return buf;
}

async function postParse(fileBuffer, filename = 'resume.pdf', mimetype = 'application/pdf') {
  const req = request(app).post('/api/v1/resume-parser/parse');
  if (fileBuffer) {
    return req.attach('resume', fileBuffer, { filename, contentType: mimetype });
  }
  return req; // no file
}

describe('Resume Parser Controller - /api/v1/resume-parser/parse', () => {
  test('should return 400 when no file is provided', async () => {
    const res = await postParse(null).expect(400);
    expect(res.body).toHaveProperty('message', 'Resume file is required');
  });

  test('should parse PDF using heuristics when no GEMINI_API_KEY is set', async () => {
    mockedPdfText = 'Jane Doe\nEmail: jane@example.com\nPhone: +1 555 123 4567\nTechnical Skills: JavaScript, Node.js, React';

    const res = await postParse(makePdf(mockedPdfText)).expect(200);
    expect(res.body).toHaveProperty('message', 'Resume parsed successfully');
    expect(res.body).toHaveProperty('parsedData');
    expect(res.body.parsedData.email).toBe('jane@example.com');
    expect(res.body.parsedData.phone).toContain('555');
    expect(res.body.parsedData.skills).toEqual(expect.arrayContaining(['JavaScript', 'Node.js', 'React']));
    expect(res.body).toHaveProperty('resume_id');
  });

  test('should use LLM JSON when GEMINI_API_KEY is set and returns valid JSON', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    mockedPdfText = 'garbage baseline text';
    mockedLlmContent = '{"name":"AI User","email":"ai@example.com","phone":"123","education":[],"experience":[],"skills":["AI"],"projects":[],"certifications":[]}';

    const res = await postParse(makePdf('anything')).expect(200);
    expect(res.body.parsedData.name).toBe('AI User');
    expect(res.body.parsedData.email).toBe('ai@example.com');
    expect(res.body.parsedData.skills).toEqual(['AI']);
  });

  test('should fallback to heuristics when LLM returns invalid content', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    mockedPdfText = 'John Smith\nEmail: john@smith.dev\nSkills: Go, Rust';
    mockedLlmContent = 'No JSON here';

    const res = await postParse(makePdf(mockedPdfText)).expect(200);
    expect(res.body.parsedData.email).toBe('john@smith.dev');
    expect(res.body.parsedData.skills).toEqual(expect.arrayContaining(['Go', 'Rust']));
  });

  test('should return 500 when pdf parser throws', async () => {
    // Override mock to throw for this test only
    const { default: pdfParse } = await import('pdf-parse');
    pdfParse.mockImplementationOnce(async () => { throw new Error('pdf fail'); });

    const res = await postParse(makePdf('anything')).expect(500);
    expect(res.body).toHaveProperty('message', 'Failed to parse PDF');
  });

  test('should return 500 when Redis set fails', async () => {
    // Make Redis set reject
    const Redis = (await import('ioredis')).default || (await import('ioredis'));
    mockedPdfText = 'Jane\nEmail: j@e.co';
    await postParse(makePdf(mockedPdfText));

    Redis.mock.instances[0].set.mockRejectedValueOnce(new Error('redis down'));

    const res = await postParse(makePdf(mockedPdfText)).expect(500);
    expect(res.body).toHaveProperty('message', 'Failed to store resume data');
  });
});
