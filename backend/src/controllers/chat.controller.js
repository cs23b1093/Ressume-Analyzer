// src/controllers/chatWithResume.fixed.controller.js
import { asyncHandler } from "../middleware/errorHandler.js";
import { ApiError } from "../utils/errorFormat.js";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
import { client } from "../config/huggingface.js";

dotenv.config();

function safeClean(s = "") {
  return String(s || "").replace(/\r/g, "").replace(/\n{2,}/g, "\n").trim();
}

function extractText(result) {
  if (!result) return "";

  let content = "";

  // Hugging Face chat completion response
  if (Array.isArray(result?.choices) && result.choices.length) {
    const choice = result.choices[0];
    if (choice?.message?.content) content = choice.message.content;
    else if (choice?.text) content = choice.text;
    else if (choice?.delta?.content) content = choice.delta.content;
  }

  // Hugging Face text generation response (fallback for older models)
  if (!content && typeof result?.generated_text === "string") content = result.generated_text;

  // direct common fields
  if (!content) {
    if (typeof result === "string") content = result;
    else if (typeof result?.text === "string") content = result.text;
    else if (typeof result?.output_text === "string") content = result.output_text;
    else if (typeof result?.content === "string") content = result.content;
  }

  // content as array of parts
  if (!content && Array.isArray(result?.content)) {
    const joined = result.content.map(part => {
      if (typeof part === "string") return part;
      if (typeof part?.text === "string") return part.text;
      if (typeof part?.content === "string") return part.content;
      // sometimes part has nested arrays
      if (Array.isArray(part?.items)) return part.items.map(i => i.text || i).join("");
      return "";
    }).join("");
    if (joined) content = joined;
  }

  // nested output or messages arrays
  if (!content && Array.isArray(result?.output)) {
    const joined = result.output.map(o => {
      if (typeof o === "string") return o;
      if (typeof o?.content === "string") return o.content;
      if (Array.isArray(o?.content)) return o.content.map(c => c.text || c).join("");
      return "";
    }).join("");
    if (joined) content = joined;
  }

  if (!content) {
    // fallback: stringify
    try {
      content = JSON.stringify(result).slice(0, 2000);
    } catch {
      return "";
    }
  }

  // For reasoning models like DeepSeek-R1, extract thinking and final response
  let thinking = "";
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/i);
  if (thinkMatch) {
    thinking = thinkMatch[1].trim();
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  }

  return safeClean(content);
}

function makeLocalFallback(message) {
  // General fallback response
  return "I'm here to help! Please ask me any question and I'll do my best to provide a helpful answer.";
}

const chatWithAI = asyncHandler(async (req, res, next) => {
  logger.info("hit chatWithAI");

  const { message } = req.body;
  if (!message) {
    throw new ApiError({ message: "Message is required", status: 400 });
  }

  // Retrieve parsed resume data from Redis
  let parsedData = null;
  try {
    const resumeCacheKey = `resume:${'anonymous'}`;
    const cachedResume = await req.redisClient.get(resumeCacheKey);
    if (cachedResume) {
      parsedData = JSON.parse(cachedResume);
      logger.info("Resume data retrieved from Redis for chat context");
    }
  } catch (err) {
    logger.warn("Failed to retrieve resume data from Redis", { message: err?.message });
  }

  const token = process.env.HF_TOKEN;
  if (!token) {
    logger.warn("No HF_TOKEN provided — returning local fallback");
    return res.status(200).json({
      message: "LLM not configured - local fallback",
      response: makeLocalFallback(message),
      success: true
    });
  }

  // Enhanced AI chat prompt with resume context if available
  const prompt = parsedData ? `
You are a helpful AI assistant with access to the user's resume data. Answer the user's question directly and helpfully, incorporating relevant information from their resume when appropriate.

User's Resume Data:
- Name: ${parsedData.name || 'Not provided'}
- Email: ${parsedData.email || 'Not provided'}
- Phone: ${parsedData.phone || 'Not provided'}
- Skills: ${Array.isArray(parsedData.skills) ? parsedData.skills.join(', ') : 'Not provided'}
- Education: ${Array.isArray(parsedData.education) ? parsedData.education.map(e => e.degree).join(', ') : 'Not provided'}
- Experience: ${Array.isArray(parsedData.experience) ? parsedData.experience.map(e => e.position).join(', ') : 'Not provided'}
- Projects: ${Array.isArray(parsedData.projects) ? parsedData.projects.map(p => p.name).join(', ') : 'Not provided'}

User's Question: "${message}"

Instructions:
- Provide clear, accurate, and helpful responses
- Be conversational and friendly
- Keep responses concise but comprehensive
- Reference the user's resume data when relevant to their question
- If the question is about career/resume topics, provide personalized advice based on their background
- If no resume data is available or relevant, answer generally

Answer the question now:
`.trim() : `
You are a helpful AI assistant. Answer the user's question directly and helpfully.

User's Question: "${message}"

Instructions:
- Provide clear, accurate, and helpful responses
- Be conversational and friendly
- Keep responses concise but comprehensive
- If the question is about career/resume topics, provide relevant advice

Answer the question now:
`.trim();

  try {
    const llmResult = await client.chatCompletion({
      model: "deepseek-ai/DeepSeek-R1",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.6
    });
    logger.info("Hugging Face invocation successful", {
      question: message.slice(0, 50),
      hasResumeData: !!parsedData
    });

    // Extract thinking and final response
    const finalResponse = extractText(llmResult);
    const thinkingMatch = llmResult?.choices?.[0]?.message?.content?.match(/<think>([\s\S]*?)<\/think>/i);
    const thinking = thinkingMatch ? thinkingMatch[1].trim() : "";

    const text = finalResponse.trim();

    if (!text) {
      logger.warn("LLM produced empty text; returning local fallback");
      return res.status(200).json({
        message: "Chat response generated (fallback)",
        response: makeLocalFallback(message),
        success: true,
        statusCode: 200
      });
    }

    // Clean and limit response
    const final = safeClean(text).split("\n").slice(0, 15).join("\n");
    return res.status(200).json({
      message: "Chat response generated",
      response: final,
      thinking: `model thinking: ${thinking}`,
      success: true,
      statusCode: 200
    });
  } catch (err) {
    logger.error("Error calling Hugging Face for chat:", { message: err?.message });
    return res.status(200).json({
      message: "Chat response generated (error fallback)",
      response: makeLocalFallback(message),
      success: true,
      statusCode: 200,
      stack: err?.stack
    });
  }
});

export { chatWithAI };
