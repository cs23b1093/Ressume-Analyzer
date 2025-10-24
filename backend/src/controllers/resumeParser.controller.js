import { asyncHandler } from "../middleware/errorHandler.js";
import { ApiError } from "../utils/errorFormat.js";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();

/* -------------------------
   dynamic import of pdf-parse
   ------------------------- */
const mod = await import("pdf-parse"); // top-level await (ESM)
const pdfModule = mod.default ?? mod; // normalize ESM/CJS interop

/* -------------------------
   small utility helpers
   ------------------------- */
const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();

function extractEmail(text = "") {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0] : "";
}

function extractPhone(text = "") {
  const m = text.match(/(\+\d{1,3}[-\s]?)?\d{3,5}[-\s]?\d{3,5}[-\s]?\d{3,5}/);
  return m ? clean(m[0]) : "";
}

function firstNonEmptyLine(text = "") {
  return (text.split(/\r?\n/).find((l) => clean(l).length > 0) || "").trim();
}

function sanitizeNameLine(line = "") {
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
  const maybe = sanitized.split(/\s{2,}|\s\|\s|—|-/)[0].trim();
  const nameCandidate = maybe
    .split(/\s+/)
    .filter((tok) => !/[@\d]/.test(tok))
    .slice(0, 4)
    .join(" ");
  return clean(nameCandidate) || clean(sanitized.split(/\s+/).slice(0, 3).join(" "));
}

function sectionLines(text = "", headerRegex) {
  const lines = text.split(/\r?\n/);
  const startIdx = lines.findIndex((l) => headerRegex.test(l.trim()));
  if (startIdx === -1) return [];
  const out = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const L = lines[i].trim();
    if (!L) break;
    if (/^[A-Z][A-Za-z0-9\s\/\-\&]{2,40}:?$/.test(L) && L.endsWith(":")) break;
    out.push(L);
  }
  return out.map(clean).filter(Boolean);
}

function parseInlineSkillGroups(text = "") {
  const groups = {};
  const normalized = text.replace(/\n/g, " ").replace(/\s{2,}/g, " ");
  const re =
    /(Languages|Language|Databases|Database|Backend|Backend \/ Frameworks|Frontend|DevOps|Cloud|Security|Tools|Technologies|Technical Skills|Skills)\s*[:\-]\s*([^•;|\n]+?)(?=(?:Languages|Databases|Backend|Frontend|DevOps|Cloud|Security|Tools|Technologies|$))/gi;
  let m;
  while ((m = re.exec(normalized)) !== null) {
    const label = m[1].toLowerCase();
    const value = m[2].trim();
    groups[label] = (groups[label] || "") + " " + value;
  }
  return Object.entries(groups).reduce((acc, [k, v]) => {
    const items = v.split(/[•,;|\/]/).map((s) => clean(s)).filter(Boolean);
    return acc.concat(items);
  }, []);
}

function fallbackCollectSkills(text = "") {
  const candidates = [];
  for (const line of text.split(/\r?\n/)) {
    if (/[A-Za-z0-9]+\s*[:\-]\s*[A-Za-z0-9]/.test(line) && /[,|;\/•]/.test(line)) {
      const after = line.split(/[:\-]/).slice(1).join(":");
      candidates.push(...after.split(/[•,;|/]/).map(clean).filter(Boolean));
    }
  }
  return candidates;
}

function extractSkills(text = "") {
  const sec = sectionLines(text, /^(Technical\s+Skills|Technical Skills|Skills)\b/i);
  if (sec.length) {
    const joined = sec.join(" ");
    const parsed = joined.split(/[•,;|\/]/).map(clean).filter(Boolean);
    if (parsed.length) return parsed;
  }
  const inline = parseInlineSkillGroups(text);
  if (inline.length) return inline;
  const fb = fallbackCollectSkills(text);
  if (fb.length) return fb;
  return [];
}

function extractEducation(text = "") {
  const lines = sectionLines(text, /^Education\b/i);
  return lines.map((l) => ({ degree: l, institution: "", year: (l.match(/20\d{2}|19\d{2}/) || [""])[0] }));
}

function extractExperience(text = "") {
  const lines = sectionLines(text, /^(Experience|Work Experience)\b/i);
  return lines.map((l) => ({ position: l, company: "", duration: "", description: "" }));
}

function extractProjects(text = "") {
  const lines = sectionLines(text, /^Projects\b/i);
  return lines.map((l) => {
    const name = l.split(":")[0].trim();
    const desc = l.split(":").slice(1).join(":").trim();
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

/* -------------------------
   Robust PDF text extractor
   Supports:
    - pdf-parse v1 (module is a function)
    - pdf-parse v2+ (exports PDFParse class)
    - ESM/CJS interop (mod.default)
   Always destroys parser instances when used.
   ------------------------- */
const extractTextFromPDF = async (buffer) => {
  if (!buffer) return "";

  const modShape = pdfModule; // normalized earlier

  // Case A: module itself is a function (old v1)
  if (typeof modShape === "function") {
    const result = await modShape(buffer);
    return (result && result.text) ? String(result.text).trim() : "";
  }

  // Case B: default is function
  if (modShape.default && typeof modShape.default === "function") {
    const result = await modShape.default(buffer);
    return (result && result.text) ? String(result.text).trim() : "";
  }

  // Case C: v2+ PDFParse class
  const PDFParseClass = modShape.PDFParse ?? (modShape.default && modShape.default.PDFParse) ?? null;
  if (PDFParseClass && typeof PDFParseClass === "function") {
    const parser = new PDFParseClass({ data: buffer });
    try {
      const textResult = await parser.getText();
      return (textResult && textResult.text) ? String(textResult.text).trim() : "";
    } finally {
      try { await parser.destroy(); } catch (e) { /* ignore cleanup errors */ }
    }
  }

  // Case D: direct getText helper (edge)
  if (modShape.getText && typeof modShape.getText === "function") {
    const r = await modShape.getText({ data: buffer });
    return (r && r.text) ? String(r.text).trim() : "";
  }

  // Unknown shape -> log for debugging and throw
  logger.error("extractTextFromPDF: unexpected pdf-parse module shape", { keys: Object.keys(modShape || {}) });
  throw new Error("Unsupported pdf-parse module shape. Run `npm ls pdf-parse` to check version.");
};

/* -------------------------
   Main controller
   ------------------------- */
const parseResumeText = asyncHandler(async (req, res) => {
  logger.info("hit parse resume file...");

  if (!req.file) throw new ApiError({ message: "Resume file is required", status: 400 });

  // 1) Extract text from PDF
  let text;
  try {
    text = await extractTextFromPDF(req.file.buffer);
  } catch (err) {
    logger.error("Failed extracting text from PDF", { message: err?.message });
    throw new ApiError({ message: "Failed to parse PDF", status: 500, meta: err?.message });
  }

  // 2) Try LLM parse if key present (non-fatal fallback to heuristics)
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
      if (Array.isArray(raw)) raw = raw.map((r) => r.text || "").join("");
      if (typeof raw !== "string") raw = String(raw || "");
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        parsed = JSON.parse(raw.slice(start, end + 1));
      } else {
        logger.warn("LLM returned no JSON object boundaries; ignoring LLM parse");
      }
    } catch (e) {
      logger.warn("LLM parse failed; using heuristics", { message: e?.message });
      parsed = null;
    }
  }

  // 3) Build final object: prefer LLM but fallback to heuristics
  const final = ensureShape({
    name: (parsed && parsed.name) || extractName(text),
    email: (parsed && parsed.email) || extractEmail(text),
    phone: (parsed && parsed.phone) || extractPhone(text),
    education:
      (parsed && Array.isArray(parsed.education) && parsed.education.length) ? parsed.education : extractEducation(text),
    experience:
      (parsed && Array.isArray(parsed.experience) && parsed.experience.length) ? parsed.experience : extractExperience(text),
    skills:
      (parsed && Array.isArray(parsed.skills) && parsed.skills.length) ? parsed.skills : extractSkills(text),
    projects:
      (parsed && Array.isArray(parsed.projects) && parsed.projects.length) ? parsed.projects : extractProjects(text),
    certifications:
      (parsed && Array.isArray(parsed.certifications) && parsed.certifications.length) ? parsed.certifications : []
  });

  logger.info("Resume parsed successfully (improved)");
  return res.status(200).json({
    message: "Resume parsed successfully",
    parsedData: final,
    success: true
  });
});

export { parseResumeText };