const testText = `Amit Sharma
Phone: +91-9876543210
Email: akps1440236@gmail.com

Education
B.Tech, Computer Science
IIT Delhi, 2020-2024

Experience
Software Engineer
Google, 2024-Present
- Developed scalable web applications
- Led team of 5 developers

Skills
- JavaScript, React, Node.js
- Python, Machine Learning
- AWS, Docker

Projects
Resume Analyzer
- Built AI-powered resume parsing tool
- Used LangChain and Gemini API
`;

async function testGeminiAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/v1/resume-parser/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: testText }),
    });

    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testGeminiAPI();
