// src/controllers/chatWithResume.fixed.controller.js
import { asyncHandler } from "../middleware/errorHandler.js";
import { ApiError } from "../utils/errorFormat.js";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();

function safeClean(s = "") {
  return String(s || "").replace(/\r/g, "").replace(/\n{2,}/g, "\n").trim();
}

function extractText(result) {
  if (!result) return "";

  // direct common fields
  if (typeof result === "string") return safeClean(result);
  if (typeof result?.text === "string") return safeClean(result.text);
  if (typeof result?.output_text === "string") return safeClean(result.output_text);
  if (typeof result?.content === "string") return safeClean(result.content);

  // content as array of parts
  if (Array.isArray(result?.content)) {
    const joined = result.content.map(part => {
      if (typeof part === "string") return part;
      if (typeof part?.text === "string") return part.text;
      if (typeof part?.content === "string") return part.content;
      // sometimes part has nested arrays
      if (Array.isArray(part?.items)) return part.items.map(i => i.text || i).join("");
      return "";
    }).join("");
    if (joined) return safeClean(joined);
  }

  // choices pattern (OpenAI-like)
  if (Array.isArray(result?.choices) && result.choices.length) {
    const texts = result.choices.map(c => {
      // GPT-style
      if (typeof c?.message?.content === "string") return c.message.content;
      if (typeof c?.text === "string") return c.text;
      if (Array.isArray(c?.delta)) return c.delta.map(d => d.text || d.content || "").join("");
      return "";
    }).join("\n");
    if (texts) return safeClean(texts);
  }

  // nested output or messages arrays
  if (Array.isArray(result?.output)) {
    const joined = result.output.map(o => {
      if (typeof o === "string") return o;
      if (typeof o?.content === "string") return o.content;
      if (Array.isArray(o?.content)) return o.content.map(c => c.text || c).join("");
      return "";
    }).join("");
    if (joined) return safeClean(joined);
  }

  // fallback: stringify
  try {
    return safeClean(JSON.stringify(result).slice(0, 2000));
  } catch {
    return "";
  }
}

function makeLocalFallback(parsedData, question) {
  // Very short, high-impact fallback reply (student-focused)
  const name = parsedData?.name || "Candidate";
  const skills = (parsedData?.skills || []).slice(0,6).join(", ") || "relevant skills";
  return `${name}: Strong basics in ${skills}. Top 3 quick steps: 1) Add one measurable metric to a project (e.g., users/latency). 2) Deploy a small project and note CI steps. 3) Convert vague bullets to "what I shipped" + impact. First impression: ready with polish — add metrics & deployment.`;
}

const chatWithResume = asyncHandler(async (req, res, next) => {
  logger.info("hit chatWithResume");

  const { message, parsedData } = req.body;
  if (!message || !parsedData) {
    throw new ApiError({ message: "Message and parsed resume data are required", status: 400 });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    logger.warn("No LLM key provided — returning local fallback");
    return res.status(200).json({
      message: "LLM not configured - local fallback",
      response: makeLocalFallback(parsedData, message),
      success: true
    });
  }

  // Create model with reasonable output limit
  const model = new ChatGoogleGenerativeAI({
    apiKey: key,
    model: "gemini-2.5-flash",
    temperature: 0.6,
    maxOutputTokens: 800
  });

  // Build a concise resume summary to reduce tokens
  const resumeSummary = {
    name: parsedData.name || "Candidate",
    skills: (parsedData.skills || []).slice(0, 10),
    experience: (parsedData.experience || []).slice(0, 2).map(e => ({
      title: e.title,
      company: e.company,
      duration: e.duration
    })),
    projects: (parsedData.projects || []).slice(0, 3).map(p => ({
      name: p.name,
      description: p.description?.slice(0, 100)
    })),
    education: parsedData.education?.[0]
  };

  // Question-focused prompt that emphasizes direct answers
  const prompt = `
You are a helpful career advisor. The user asked you a specific question about their resume/career.

CRITICAL: Answer the user's EXACT question directly. Don't give generic advice.

User's Question: "${message}"

Candidate Info:
${JSON.stringify(resumeSummary, null, 2)}

Instructions:
- Answer their specific question in 2-4 short paragraphs
- Reference their actual skills/projects/experience when relevant
- Be conversational and encouraging
- Keep under 150 words
- If you suggest numbers/metrics, prefix with [SUGGESTED]

Answer their question now:
`.trim();

  try {
    const llmResult = await model.invoke(prompt);
    logger.info("LLM invocation successful", { 
      usage: llmResult.usage_metadata,
      finishReason: llmResult.response_metadata?.finishReason,
      question: message.slice(0, 50)
    });
    
    const text = extractText(llmResult).trim();

    if (!text) {
      logger.warn("LLM produced empty text; returning local fallback");
      return res.status(200).json({
        message: "Chat response generated (fallback)",
        response: makeLocalFallback(parsedData, message),
        success: true,
        statusCode: 200
      });
    }

    // Clean and limit response
    const final = safeClean(text).split("\n").slice(0, 15).join("\n");
    return res.status(200).json({
      message: "Chat response generated",
      response: final,
      success: true,
      statusCode: 200
    });
  } catch (err) {
    logger.error("Error calling LLM for chat:", { message: err?.message });
    return res.status(200).json({
      message: "Chat response generated (error fallback)",
      response: makeLocalFallback(parsedData, message),
      success: true,
      statusCode: 200
    });
  }
});

export { chatWithResume };