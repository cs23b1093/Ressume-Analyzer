import { asyncHandler } from "../middleware/errorHandler.js";
import { ApiError } from "../utils/errorFormat.js";
import logger from "../utils/logger.js";
import { Resume } from "../models/resume.model.js";
import { Job } from "../models/jobs.model.js";
import { client } from '../config/huggingface.js'

/**
 * Clean and normalize text for ATS processing
 * @param {string} text - Input text
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove special characters except letters, numbers, spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Tokenize and clean job description text
 * @param {string} text - Job description
 * @returns {string[]} - Array of words
 */
function tokenizeText(text) {
  return cleanText(text).split(/\s+/).filter(word => word.length > 0);
}

/**
 * Remove common stop words
 * @param {string[]} words - Array of words
 * @returns {string[]} - Filtered words
 */
function removeStopWords(words) {
  const stopWords = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'with', 'from',
    'and', 'or', 'but', 'this', 'that', 'these', 'those', 'what', 'which',
    'who', 'when', 'where', 'why', 'how', 'is', 'are', 'was', 'were',
    'be', 'been', 'have', 'has', 'had', 'i', 'you', 'he', 'she', 'it',
    'we', 'they'
  ]);

  return words.filter(word => !stopWords.has(word));
}

/**
 * Filter short words (less than 3 characters)
 * @param {string[]} words - Array of words
 * @returns {string[]} - Filtered words
 */
function filterShortWords(words) {
  return words.filter(word => word.length >= 3);
}

/**
 * Calculate word frequency
 * @param {string[]} words - Array of words
 * @returns {Object} - Frequency map
 */
function calculateWordFrequency(words) {
  const freq = {};
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });
  return freq;
}

/**
 * Extract top keywords from job description
 * @param {string} jobDescription - Job description text
 * @param {number} topN - Number of top keywords to extract (default 25)
 * @returns {string[]} - Array of top keywords
 */
function extractTopKeywords(jobDescription, topN = 25) {
  let words = tokenizeText(jobDescription);
  words = removeStopWords(words);
  words = filterShortWords(words);
  const freq = calculateWordFrequency(words);

  // Sort by frequency descending
  const sortedWords = Object.entries(freq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, topN)
    .map(([word]) => word);

  return sortedWords;
}

/**
 * Check exact keyword matches in resume text
 * @param {string[]} keywords - Keywords from job description
 * @param {string} resumeText - Resume text
 * @returns {Object} - Match results
 */
function matchKeywords(keywords, resumeText) {
  const cleanedResume = cleanText(resumeText);
  const matched = [];
  const missing = [];

  keywords.forEach(keyword => {
    if (cleanedResume.includes(keyword)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  return { matched, missing };
}

/**
 * Calculate keyword match score
 * @param {string[]} matched - Matched keywords
 * @param {string[]} total - Total keywords
 * @returns {number} - Score percentage
 */
function calculateKeywordScore(matched, total) {
  if (total.length === 0) return 0;
  return Math.round((matched.length / total.length) * 100);
}

/**
 * Extract skills from job description
 * @param {string} jobDescription - Job description
 * @returns {string[]} - Skills array
 */
function extractSkillsFromJob(jobDescription) {
  const commonSkills = [
    'python', 'java', 'javascript', 'c++', 'sql', 'react', 'node.js', 'nodejs',
    'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'devops',
    'ci/cd', 'machine learning', 'data analysis', 'tensorflow', 'pandas',
    'html', 'css', 'mongodb', 'postgresql', 'linux', 'bash', 'api', 'rest',
    'graphql', 'typescript', 'vue', 'angular', 'express', 'django', 'flask'
  ];

  const cleanedJob = cleanText(jobDescription);
  return commonSkills.filter(skill => cleanedJob.includes(skill));
}

/**
 * Match skills between job and resume
 * @param {string[]} jobSkills - Skills from job
 * @param {string[]} resumeSkills - Skills from resume
 * @returns {Object} - Match results
 */
function matchSkills(jobSkills, resumeSkills) {
  const resumeSkillsLower = resumeSkills.map(skill => cleanText(skill));
  const matched = [];
  const missing = [];

  jobSkills.forEach(skill => {
    const skillLower = cleanText(skill);
    if (resumeSkillsLower.some(resumeSkill => resumeSkill.includes(skillLower))) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  return { matched, missing };
}

/**
 * Calculate skills match score
 * @param {string[]} matched - Matched skills
 * @param {string[]} total - Total skills
 * @returns {number} - Score percentage
 */
function calculateSkillsScore(matched, total) {
  if (total.length === 0) return 0;
  return Math.round((matched.length / total.length) * 100);
}

/**
 * Check resume sections presence
 * @param {Object} resumeData - Parsed resume data
 * @returns {Object} - Section presence results
 */
function checkSectionsPresence(resumeData) {
  const sections = {
    experience: !!(resumeData.experience && resumeData.experience.length > 0),
    education: !!(resumeData.education && resumeData.education.length > 0),
    skills: !!(resumeData.skills && resumeData.skills.length > 0),
    contact: !!(resumeData.email || resumeData.phone)
  };

  const presentCount = Object.values(sections).filter(Boolean).length;
  const totalSections = Object.keys(sections).length;
  const score = Math.round((presentCount / totalSections) * 100);

  return { sections, presentCount, totalSections, score };
}

/* -------------------------
   CONTACT INFORMATION VALIDATION
   ------------------------- */

/**
 * Validate contact information
 * @param {Object} resumeData - Parsed resume data
 * @returns {Object} - Contact validation results
 */
function validateContactInfo(resumeData) {
  const emailPresent = !!(resumeData.email && resumeData.email.trim());
  const phonePresent = !!(resumeData.phone && resumeData.phone.trim());

  const score = Math.round(((emailPresent ? 1 : 0) + (phonePresent ? 1 : 0)) / 2 * 100);

  return { emailPresent, phonePresent, score };
}

/* -------------------------
   EDUCATION MATCHING
   ------------------------- */

/**
 * Check education match (basic implementation)
 * @param {Object} resumeData - Parsed resume data
 * @param {Object} jobData - Job data
 * @returns {number} - Education match score
 */
function checkEducationMatch(resumeData, jobData) {
  // For MVP, assume education is present if education section exists
  // In future, could match specific degrees/requirements
  const hasEducation = !!(resumeData.education && resumeData.education.length > 0);
  return hasEducation ? 100 : 0;
}

/**
 * Calculate basic formatting score (placeholder for future enhancement)
 * @returns {number} - Format score
 */
function calculateFormatScore() {
  // TODO: 
    // For MVP, return a default score
    // In future, could analyze PDF structure, fonts, etc.
  return 80;
}

/**
 * Calculate final ATS score
 * @param {Object} scores - Individual component scores
 * @returns {number} - Final ATS score
 */
function calculateFinalATSScore(scores) {
  const weights = {
    keywordMatch: 0.40,
    skillsMatch: 0.25,
    sectionPresence: 0.15,
    contactValidation: 0.10,
    educationMatch: 0.05,
    formatScore: 0.05
  };

  const finalScore = Math.round(
    (scores.keywordMatch * weights.keywordMatch) +
    (scores.skillsMatch * weights.skillsMatch) +
    (scores.sectionPresence * weights.sectionPresence) +
    (scores.contactValidation * weights.contactValidation) +
    (scores.educationMatch * weights.educationMatch) +
    (scores.formatScore * weights.formatScore)
  );

  return Math.min(100, Math.max(0, finalScore));
}

/* -------------------------
   GENERATE RECOMMENDATIONS
   ------------------------- */

/**
 * Generate improvement recommendations
 * @param {Object} analysis - Complete analysis results
 * @returns {string[]} - Array of recommendations
 */

async function getResponse(prompt) {
  const response = await client.chatCompletion({
    model: "deepseek-ai/DeepSeek-R1",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 800,
    temperature: 0.7
  });

  return response.choices[0].message.content;
}

// Function to auto-format job description into dynamic sections
async function formatJobDescription(job_description) {
  const prompt = `
You are a professional technical writer and HR documentation expert.

Your task: 
Take the following raw job description text and structure it into **clear, logical sections**. 
You should automatically decide what sections are most relevant (e.g., "About the Company", "Role Overview", "Responsibilities", "Skills", "Perks", "Culture", "Application Process", etc.) 
based on the content itself. 

Rules:
- Do NOT invent details — only organize and clean the existing information.
- Add headings and subheadings naturally where appropriate.
- Keep the tone professional and readable.
- Output should be in plain text (no markdown or HTML).
- Use bullet points only where it improves clarity.

Raw Job Description:
${job_description}
`;

  const response = getResponse(prompt);
  return response;
}


function generateRecommendations(analysis, resumeText, jobDescription = null) {
  const recommendations = [];

  // Keyword recommendations '
  logger.warn(analysis);
  if (analysis.keywordAnalysis.missing.length > 0) {
    recommendations.push(`Add missing keywords: ${analysis.keywordAnalysis.missing.slice(0, 5).join(', ')}`);
  }

  // Skills recommendations
  if (analysis.skillsAnalysis.missing.length > 0) {
    recommendations.push(`Include relevant skills: ${analysis.skillsAnalysis.missing.slice(0, 3).join(', ')}`);
  }

  // Section recommendations
  const missingSections = Object.entries(analysis.sectionAnalysis.sections)
    .filter(([, present]) => !present)
    .map(([section]) => section);

  if (missingSections.length > 0) {
    recommendations.push(`Add missing sections: ${missingSections.join(', ')}`);
  }

  // Contact recommendations
  if (!analysis.contactAnalysis.emailPresent) {
    recommendations.push('Add a valid email address');
  }
  if (!analysis.contactAnalysis.phonePresent) {
    recommendations.push('Add a phone number');
  }

  // General recommendations
  recommendations.push('Use standard section headings (Experience, Education, Skills)');
  recommendations.push('Quantify achievements with numbers and metrics');
  recommendations.push('Tailor resume keywords to match job description');

  // AI-powered recommendations prompt
  const prompt = jobDescription ? `
      You are an expert resume consultant and ATS (Applicant Tracking System) specialist. Analyze the following resume against the job description and provide specific, actionable recommendations.

      JOB DESCRIPTION:
      ${jobDescription}

      RESUME CONTENT:
      ${resumeText}

      ANALYSIS DATA:
      - Missing Keywords: ${analysis.keywordAnalysis.missing.join(', ') || 'None identified'}
      - Missing Skills: ${analysis.skillsAnalysis.missing.join(', ') || 'None identified'}
      - Missing Sections: ${missingSections.join(', ') || 'None'}
      - ATS Score: ${analysis.atsScore || 'Not calculated'}
      - Contact Info Complete: ${analysis.contactAnalysis.emailPresent && analysis.contactAnalysis.phonePresent}

      Please provide:
      1. **Top 3 Priority Improvements**: Most critical changes to increase ATS match and interview chances
      2. **Content Optimization**: Specific phrases or bullet points to add/modify based on job requirements
      3. **Keyword Integration**: Where and how to naturally incorporate missing keywords
      4. **Achievement Enhancement**: Suggest metrics or quantifiable results to strengthen impact
      5. **ATS Compatibility**: Formatting or structural changes to improve ATS parsing

      Format your response as a JSON array of recommendation objects with:
      - "category": (priority|content|keywords|achievements|ats)
      - "title": Brief recommendation title
      - "description": Detailed actionable advice
      - "impact": (high|medium|low)

      Example:
      [
        {
          "category": "priority",
          "title": "Add Project Management Experience",
          "description": "The job requires 3+ years of project management. Add a bullet point highlighting your project leadership experience, specifically mentioning Agile methodology and stakeholder management.",
          "impact": "high"
        }
      ]
        `.trim() : `
      You are an expert resume consultant. Analyze this resume and provide general best-practice recommendations to improve its effectiveness.

      RESUME CONTENT:
      ${resumeText}

      ANALYSIS DATA:
      - Missing Sections: ${missingSections.join(', ') || 'None'}
      - Contact Info Complete: ${analysis.contactAnalysis.emailPresent && analysis.contactAnalysis.phonePresent}

      Please provide:
      1. **Structure & Formatting**: Improvements to layout and section organization
      2. **Content Quality**: Ways to strengthen descriptions and achievements
      3. **Professional Impact**: Suggestions to better showcase experience and value
      4. **ATS Optimization**: General tips to improve ATS compatibility

      Format your response as a JSON array of recommendation objects with:
      - "category": (structure|content|impact|ats)
      - "title": Brief recommendation title
      - "description": Detailed actionable advice
      - "impact": (high|medium|low)
        `.trim();

  return {
    basicRecommendations: recommendations,
    aiPrompt: prompt
  };
}

// Enhanced function to get AI recommendations
async function getAIRecommendations(analysis, resumeText, jobDescription = null) {
  const { basicRecommendations, aiPrompt } = generateRecommendations(analysis, resumeText, jobDescription);
  
  try {
    const aiResponse = await getResponse(aiPrompt);
    
    // Parse AI response (assuming JSON format)
    let aiRecommendations = [];
    try {
      aiRecommendations = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      // Fallback: treat as plain text recommendations
      aiRecommendations = [{
        category: 'general',
        title: 'AI Analysis',
        description: aiResponse,
        impact: 'medium'
      }];
    }

    return {
      basic: basicRecommendations,
      ai: aiRecommendations,
      combined: [
        ...basicRecommendations.map(rec => ({
          category: 'basic',
          title: rec,
          description: rec,
          impact: 'medium'
        })),
        ...aiRecommendations
      ]
    };
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return {
      basic: basicRecommendations,
      ai: [],
      combined: basicRecommendations.map(rec => ({
        category: 'basic',
        title: rec,
        description: rec,
        impact: 'medium'
      }))
    };
  }
}

/* -------------------------
   ROUTE HANDLERS
   ------------------------- */
const calculateATSScore = asyncHandler(async (req, res) => {
  logger.info('hit calculate ATS score...');

  const { job_description, resume_id } = req.body;

  if (!job_description) {
    throw new ApiError({ message: 'job description is required', status: 400 });
  }

  if (!resume_id) {
    throw new ApiError({ message: 'resume_id is required', status: 400 });
  }

  const jobData = await formatJobDescription (job_description);
  console.log(jobData);
  // Fetch resume data from Redis
  const redisKey = `resume:${resume_id}`;
  let resumeDataString;
  try {
    resumeDataString = await req.redisClient.get(redisKey);
  } catch (redisError) {
    logger.error("Failed to fetch resume data from Redis", { message: redisError?.message });
    throw new ApiError({ message: "Failed to retrieve resume data", status: 500, meta: redisError?.message });
  }

  if (!resumeDataString) {
    throw new ApiError({ message: 'Resume data not found or expired', status: 404 });
  }

  let resumeData;
  try {
    resumeData = JSON.parse(resumeDataString);
  } catch (parseError) {
    logger.error("Failed to parse resume data from Redis", { message: parseError?.message });
    throw new ApiError({ message: "Invalid resume data format", status: 500, meta: parseError?.message });
  }

  if (!jobData) {
    throw new ApiError({ message: 'Could not format job description', status: 404 });
  }

  // Combine resume text for analysis
  const resumeText = [
    resumeData.summary || '',
    resumeData.experience || '',
    resumeData.education || '',
    (resumeData.skills || []).join(' ') || '',
    (resumeData.projects || []).join(' ') || '',
    (resumeData.certifications || []).join(' ') || ''
  ].join(' ');

  // Extract keywords from job description
  const jobKeywords = extractTopKeywords(jobData);

  // Keyword matching
  const keywordAnalysis = matchKeywords(jobKeywords, resumeText);
  const keywordScore = calculateKeywordScore(keywordAnalysis.matched, jobKeywords);

  // Skills matching
  const jobSkills = extractSkillsFromJob(jobData);
  const skillsAnalysis = matchSkills(jobSkills, resumeData.skills || []);
  const skillsScore = calculateSkillsScore(skillsAnalysis.matched, jobSkills);

  // Section presence
  const sectionAnalysis = checkSectionsPresence({
    experience: resumeData.experience,
    education: resumeData.education,
    skills: resumeData.skills,
    email: resumeData.email,
    phone: resumeData.phone
  });

  // Contact validation
  const contactAnalysis = validateContactInfo({
    email: resumeData.email,
    phone: resumeData.phone
  });

  // Education matching
  const educationScore = checkEducationMatch(resumeData, jobData);

  // Format score
  const formatScore = calculateFormatScore();

  // Calculate final score
  const componentScores = {
    keywordMatch: keywordScore,
    skillsMatch: skillsScore,
    sectionPresence: sectionAnalysis.score,
    contactValidation: contactAnalysis.score,
    educationMatch: educationScore,
    formatScore: formatScore
  };

  const finalATSScore = calculateFinalATSScore(componentScores);

  const analysis = {
    keywordAnalysis,
    skillsAnalysis,
    sectionAnalysis,
    contactAnalysis
  }
  logger.info(analysis);
  // Generate recommendations
  const recommendations = getAIRecommendations({
    analysis, resumeData ,jobData
  });

  // Prepare response
  const result = {
    overallScore: finalATSScore,
    scoreBreakdown: componentScores,
    keywordAnalysis: {
      matched: keywordAnalysis.matched,
      missing: keywordAnalysis.missing,
      total: jobKeywords.length
    },
    skillsAnalysis: {
      matched: skillsAnalysis.matched,
      missing: skillsAnalysis.missing,
      total: jobSkills.length
    },
    sectionAnalysis: sectionAnalysis.sections,
    contactAnalysis: {
      emailPresent: contactAnalysis.emailPresent,
      phonePresent: contactAnalysis.phonePresent
    },
    recommendations: recommendations,
    scoreInterpretation: getScoreInterpretation(finalATSScore)
  };

  logger.info(`ATS score calculated: ${finalATSScore}% for job`);

  res.status(200).json({
    message: 'ATS score calculated successfully',
    data: result,
    success: true,
    statusCode: 200
  });
});

/**
 * Get score interpretation based on range
 * @param {number} score - ATS score
 * @returns {string} - Interpretation text
 */
function getScoreInterpretation(score) {
  if (score >= 90) return 'Excellent Match (High chance of passing ATS)';
  if (score >= 80) return 'Very Good Match (Likely to pass)';
  if (score >= 70) return 'Good Match (Moderate chance)';
  if (score >= 60) return 'Fair Match (Needs improvement)';
  return 'Poor Match (Unlikely to pass)';
}

export { calculateATSScore };
