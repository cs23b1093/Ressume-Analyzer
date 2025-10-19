import { asyncHandler } from "../middleware/errorHandler.js";
import { ApiError } from "../utils/errorFormat.js";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();

const clean = s => (String(s || "")).replace(/\s+/g, " ").trim();

function extractEmail(text = "") {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0] : "";
}

function extractPhone(text = "") {
  const m = text.match(/(\+\d{1,3}[-\s]?)?\d{3,5}[-\s]?\d{3,5}[-\s]?\d{3,5}/);
  return m ? clean(m[0]) : "";
}

function firstNonEmptyLine(text = "") {
  return (text.split(/\r?\n/).find(l => clean(l).length > 0) || "").trim();
}

function sanitizeNameLine(line = "") {
  // Remove common inline tokens that may appear on the first line
  return line
    .replace(/\bPhone[:\s]/i, "")
    .replace(/\bTel[:\s]/i, "")
    .replace(/\bEmail[:\s]/i, "")
    .replace(/\bLinkedIn[:\s]/i, "")
    .replace(/\bGithub[:\s]/i, "")
    .replace(/\|/g, " ")
    .replace(/,+/g, " ")
    .trim();
}

function extractName(text = "") {
  const first = firstNonEmptyLine(text);
  if (!first) return "";
  const sanitized = sanitizeNameLine(first);
  // If first line still has '@' or phone digits, reduce it
  const maybe = sanitized.split(/\s{2,}|\s\|\s|—|-/)[0].trim();
  // Prefer only letters and limited punctuation (no email/phone)
  const nameCandidate = maybe.split(/\s+/).filter(tok => !/[@\d]/.test(tok)).slice(0, 4).join(" ");
  return clean(nameCandidate) || clean(sanitized.split(/\s+/).slice(0,3).join(" "));
}

// Extract lines under a header (case-insensitive)
function sectionLines(text = "", headerRegex) {
  const lines = text.split(/\r?\n/);
  const startIdx = lines.findIndex(l => headerRegex.test(l.trim()));
  if (startIdx === -1) return [];
  // collect until next blank line or next header-like line (big word + colon)
  const out = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const L = lines[i].trim();
    if (!L) break;
    // if line looks like a new section header, stop
    if (/^[A-Z][A-Za-z0-9\s\/\-\&]{2,40}:?$/.test(L) && L.endsWith(":")) break;
    out.push(L);
  }
  return out.map(clean).filter(Boolean);
}

// Parse inline skill groups like: "Languages: Java, C/C++, JavaScript, TypeScript   Databases: MongoDB, Redis"
function parseInlineSkillGroups(text = "") {
  const groups = {};
  // Normalize separators so split will work
  const normalized = text.replace(/\n/g, " ").replace(/\s{2,}/g, " ");
  // Look for common labels and capture their values
  const re = /(Languages|Language|Databases|Database|Backend|Backend \/ Frameworks|Frontend|DevOps|Cloud|Security|Tools|Technologies|Technical Skills|Skills)\s*[:\-]\s*([^•;|\n]+?)(?=(?:Languages|Databases|Backend|Frontend|DevOps|Cloud|Security|Tools|Technologies|$))/gi;
  let m;
  while ((m = re.exec(normalized)) !== null) {
    const label = m[1].toLowerCase();
    const value = m[2].trim();
    groups[label] = (groups[label] || "") + " " + value;
  }
  // If nothing matched, try grabbing any "Languages:" or single-line Skills header
  return Object.entries(groups).reduce((acc, [k, v]) => {
    const items = v.split(/[•,;|\/]/).map(s => clean(s)).filter(Boolean);
    return acc.concat(items);
  }, []);
}

// Generic fallback: grab any token lists that look like skills anywhere
function fallbackCollectSkills(text = "") {
  const candidates = [];
  // lines with typical skill delimiters
  for (const line of text.split(/\r?\n/)) {
    if (/[A-Za-z0-9]+\s*[:\-]\s*[A-Za-z0-9]/.test(line) && /[,|;\/•]/.test(line)) {
      // likely "Languages: Java, C++"
      const after = line.split(/[:\-]/).slice(1).join(":");
      candidates.push(...after.split(/[•,;|/]/).map(clean).filter(Boolean));
    }
  }
  return candidates;
}

function extractSkills(text = "") {
  // 1) Prefer explicit 'Technical Skills' / 'Skills' sections
  const sec = sectionLines(text, /^(Technical\s+Skills|Technical Skills|Skills)\b/i);
  if (sec.length) {
    const joined = sec.join(" ");
    const parsed = joined.split(/[•,;|\/]/).map(clean).filter(Boolean);
    if (parsed.length) return parsed;
  }

  // 2) Try inline labeled groups parsing
  const inline = parseInlineSkillGroups(text);
  if (inline.length) return inline;

  // 3) Fallback heuristics
  const fb = fallbackCollectSkills(text);
  if (fb.length) return fb;

  // 4) Nothing found
  return [];
}

function extractEducation(text = "") {
  const lines = sectionLines(text, /^Education\b/i);
  return lines.map(l => ({ degree: l, institution: "", year: (l.match(/20\d{2}|19\d{2}/) || [""])[0] }));
}

function extractExperience(text = "") {
  const lines = sectionLines(text, /^(Experience|Work Experience)\b/i);
  return lines.map(l => ({ position: l, company: "", duration: "", description: "" }));
}

function extractProjects(text = "") {
  const lines = sectionLines(text, /^Projects\b/i);
  return lines.map(l => {
    const name = l.split(':')[0].trim();
    const desc = l.split(':').slice(1).join(':').trim();
    return { name, description: desc, technologies: [] };
  });
}

function ensureShape(obj = {}) {
  return {
    name: obj.name || "",
    email: obj.email || "",
    phone: obj.phone || "",
    education: obj.education || [],
    experience: obj.experience || [],
    skills: obj.skills || [],
    projects: obj.projects || [],
    certifications: obj.certifications || []
  };
}

// ----------------------
// Controller (simple LLM attempt + robust fallback)
// ----------------------
const parseResumeText = asyncHandler(async (req, res) => {
  logger.info("hit parse resume text...");

  const { text } = req.body;
  // TODO:
      // try {
      //   const res = await req.redisClient.set(process.env.REDIS_KEY, text, "EX", 3600)
      //   if (res) throw new ApiError({ message: "Resume text is required", status: 400 })
      // } catch (error) {
      //   logger.error(`Internal Server Error`);
      //   res.status(error.status || 500).json({
      //     message: error.message || "Internal Server Error",
      //     success: false,
      //     statusCode: error.status || 500
      //   })    
      // }
  if (!text) throw new ApiError({ message: "Resume text is required", status: 400 });

  // Try LLM if key present (non-blocking fallbacks exist)
  let parsed = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      const model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
        model: "gemini-2.5-flash",
        temperature: 0
      });

      const prompt = `Extract ONLY valid JSON with keys: name,email,phone,education (array),experience (array),skills (array),projects (array),certifications (array). Use empty strings/arrays if absent. Resume Text: ${text}`;
      const result = await model.invoke(prompt);
      let raw = result?.content;
      if (Array.isArray(raw)) raw = raw.map(r => r.text || "").join("");
      if (typeof raw !== "string") raw = String(raw || "");
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        parsed = JSON.parse(raw.slice(start, end + 1));
      }
    } catch (e) {
      logger.warn("LLM parse failed; will use heuristics", { message: e?.message });
      parsed = null;
    }
  }

  // Build final result: prefer parsed fields but fallback to heuristics that actually map properly
  const final = ensureShape({
    name: (parsed && parsed.name) || extractName(text),
    email: (parsed && parsed.email) || extractEmail(text),
    phone: (parsed && parsed.phone) || extractPhone(text),
    education: (parsed && Array.isArray(parsed.education) && parsed.education.length) ? parsed.education : extractEducation(text),
    experience: (parsed && Array.isArray(parsed.experience) && parsed.experience.length) ? parsed.experience : extractExperience(text),
    skills: (parsed && Array.isArray(parsed.skills) && parsed.skills.length) ? parsed.skills : extractSkills(text),
    projects: (parsed && Array.isArray(parsed.projects) && parsed.projects.length) ? parsed.projects : extractProjects(text),
    certifications: (parsed && Array.isArray(parsed.certifications) && parsed.certifications.length) ? parsed.certifications : []
  });

  logger.info("Resume parsed successfully (improved)");
  return res.status(200).json({
    message: "Resume parsed successfully",
    parsedData: final,
    success: true
  });
});

export { parseResumeText };
