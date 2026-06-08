const Resume = require('../models/Resume');
const AIReport = require('../models/AIReport');
const User = require('../models/User');
const InterviewHistory = require('../models/InterviewHistory');
const LearningPlan = require('../models/LearningPlan');
const { generateAIResponse, parseAIJson: parseAIJSON } = require('../config/aiProvider');

/**
 * Helper to increment AI usage count for a user
 */
const incrementAIUsage = async (userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { aiUsageCount: 1 } });
};

/**
 * Helper to save an AI report
 */
const saveAIReport = async ({ userId, reportType, title, content }) => {
  return await AIReport.create({ userId, reportType, title, content });
};

// ============================================================
// 1. ANALYZE RESUME
// ============================================================
/**
 * @desc    AI Resume Analysis
 * @route   POST /api/ai/analyze-resume
 * @access  Private
 */
const analyzeResume = async (req, res, next) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'resumeId is required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (!resume.parsedText || resume.parsedText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is too short or could not be parsed. Please upload a text-based PDF.',
      });
    }

    const systemInstruction = `You are an expert career counselor and resume reviewer with 15+ years of experience in HR and talent acquisition. 
You analyze resumes professionally and provide actionable, honest, specific feedback. 
Always respond ONLY with valid JSON matching the exact structure requested.`;

    const prompt = `Analyze the following resume text and provide a comprehensive evaluation.

RESUME TEXT:
"""
${resume.parsedText.substring(0, 4000)}
"""

Return ONLY a valid JSON object with this exact structure:
{
  "score": <number 0-100 representing overall resume quality>,
  "strengths": [<list of 3-5 specific strengths found in the resume>],
  "weaknesses": [<list of 3-5 specific areas that need improvement>],
  "suggestions": [<list of 5-7 specific, actionable improvement suggestions>],
  "keywords": [<list of 10-15 relevant keywords/skills found in the resume>],
  "atsCompatibility": "<string: 'Excellent' | 'Good' | 'Fair' | 'Poor' with brief explanation>",
  "overallVerdict": "<2-3 sentence professional verdict on the resume>"
}`;

    const aiResponse = await generateAIResponse(prompt, systemInstruction);
    const parsed = parseAIJSON(aiResponse);

    if (!parsed) {
      return res.status(500).json({
        success: false,
        message: 'AI returned an unparseable response. Please try again.',
      });
    }

    // Save analysis to Resume model
    resume.score = parsed.score || 0;
    resume.analysis = {
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      suggestions: parsed.suggestions || [],
      keywords: parsed.keywords || [],
      atsCompatibility: parsed.atsCompatibility || '',
      overallVerdict: parsed.overallVerdict || '',
    };
    resume.extractedSkills = parsed.keywords || [];
    await resume.save();

    // Save AI report
    await saveAIReport({
      userId: req.user._id,
      reportType: 'resume-analysis',
      title: `Resume Analysis - ${resume.fileName}`,
      content: parsed,
    });

    await incrementAIUsage(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      analysis: parsed,
      resumeId: resume._id,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 2. GENERATE SUMMARY
// ============================================================
/**
 * @desc    Generate professional summary from resume
 * @route   POST /api/ai/generate-summary
 * @access  Private
 */
const generateSummary = async (req, res, next) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'resumeId is required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (!resume.parsedText || resume.parsedText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is too short to generate a summary.',
      });
    }

    const systemInstruction = `You are a professional resume writer who crafts compelling, concise, and impactful professional summaries.
Your summaries are tailored to the candidate's experience level and target role, written in first person without "I", 
optimized for ATS systems and human readers alike. Always respond ONLY with valid JSON.`;

    const prompt = `Based on the following resume content, generate a compelling 3-4 sentence professional summary that:
- Highlights the candidate's strongest qualifications
- Mentions key technical skills and domain expertise
- Is ATS-friendly with relevant keywords
- Is written in a confident, professional tone (first person, no "I")

RESUME TEXT:
"""
${resume.parsedText.substring(0, 3000)}
"""

Return ONLY a valid JSON object:
{
  "summary": "<the professional summary text>",
  "keyHighlights": [<list of 4-5 key highlights used in the summary>]
}`;

    const aiResponse = await generateAIResponse(prompt, systemInstruction);
    const parsed = parseAIJSON(aiResponse);

    if (!parsed || !parsed.summary) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate summary. Please try again.',
      });
    }

    // Save summary to resume
    resume.generatedSummary = parsed.summary;
    await resume.save();

    await saveAIReport({
      userId: req.user._id,
      reportType: 'summary-generation',
      title: `Professional Summary - ${resume.fileName}`,
      content: parsed,
    });

    await incrementAIUsage(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Professional summary generated successfully',
      summary: parsed.summary,
      keyHighlights: parsed.keyHighlights || [],
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 3. GENERATE COVER LETTER
// ============================================================
/**
 * @desc    Generate tailored cover letter
 * @route   POST /api/ai/generate-cover-letter
 * @access  Private
 */
const generateCoverLetter = async (req, res, next) => {
  try {
    const { resumeId, jobDescription, jobTitle, company } = req.body;

    if (!resumeId || !jobDescription || !jobTitle || !company) {
      return res.status(400).json({
        success: false,
        message: 'resumeId, jobDescription, jobTitle, and company are required',
      });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const systemInstruction = `You are an expert cover letter writer who creates compelling, personalized cover letters.
You craft cover letters that match the candidate's experience to the job requirements, using a professional tone 
that stands out to hiring managers. Always respond ONLY with valid JSON.`;

    const prompt = `Write a professional, tailored cover letter for the following:

JOB TITLE: ${jobTitle}
COMPANY: ${company}
JOB DESCRIPTION:
"""
${jobDescription.substring(0, 2000)}
"""

CANDIDATE'S RESUME:
"""
${resume.parsedText ? resume.parsedText.substring(0, 2000) : 'No resume text available. Use general professional skills.'}
"""

Requirements:
- 3-4 paragraphs (opening, body 1-2, closing)
- Specific references to the job requirements
- Highlights relevant candidate experiences
- Professional but engaging tone
- Ends with a clear call to action

Return ONLY a valid JSON object:
{
  "coverLetter": "<the full cover letter text with paragraph breaks using \\n\\n>",
  "matchedSkills": [<list of skills matched between resume and job description>],
  "tone": "<description of the tone used>"
}`;

    const aiResponse = await generateAIResponse(prompt, systemInstruction);
    const parsed = parseAIJSON(aiResponse);

    if (!parsed || !parsed.coverLetter) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate cover letter. Please try again.',
      });
    }

    await saveAIReport({
      userId: req.user._id,
      reportType: 'cover-letter',
      title: `Cover Letter - ${jobTitle} at ${company}`,
      content: { ...parsed, jobTitle, company },
    });

    await incrementAIUsage(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Cover letter generated successfully',
      coverLetter: parsed.coverLetter,
      matchedSkills: parsed.matchedSkills || [],
      tone: parsed.tone || '',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 4. SKILL GAP ANALYSIS
// ============================================================
/**
 * @desc    Skill gap analysis between resume and target role
 * @route   POST /api/ai/skill-gap
 * @access  Private
 */
const skillGapAnalysis = async (req, res, next) => {
  try {
    const { resumeId, targetRole } = req.body;

    if (!resumeId || !targetRole) {
      return res.status(400).json({
        success: false,
        message: 'resumeId and targetRole are required',
      });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const systemInstruction = `You are a career development expert and technical recruiter with deep knowledge of 
skill requirements across various tech and non-tech roles. You provide precise, actionable skill gap analyses. 
Always respond ONLY with valid JSON.`;

    const prompt = `Perform a comprehensive skill gap analysis for a candidate targeting the role of "${targetRole}".

CANDIDATE'S RESUME/SKILLS:
"""
${resume.parsedText ? resume.parsedText.substring(0, 2500) : `Skills: ${(resume.extractedSkills || []).join(', ')}`}
"""

Analyze the gap between the candidate's current skills and the requirements for a ${targetRole} position.

Return ONLY a valid JSON object:
{
  "currentSkills": [<list of skills the candidate currently has based on resume>],
  "missingSkills": [<list of critical skills required for ${targetRole} that are missing>],
  "prioritySkills": [<top 5 skills to learn first, ordered by priority and job market demand>],
  "niceToHaveSkills": [<skills that would enhance candidacy but aren't critical>],
  "estimatedTime": "<realistic time estimate to bridge the gap e.g., '3-6 months'>",
  "readinessScore": <number 0-100 representing current readiness for this role>,
  "recommendations": [<list of 3-4 specific recommendations to bridge the gap>]
}`;

    const aiResponse = await generateAIResponse(prompt, systemInstruction);
    const parsed = parseAIJSON(aiResponse);

    if (!parsed) {
      return res.status(500).json({
        success: false,
        message: 'Failed to analyze skill gap. Please try again.',
      });
    }

    await saveAIReport({
      userId: req.user._id,
      reportType: 'skill-gap',
      title: `Skill Gap Analysis - ${targetRole}`,
      content: { ...parsed, targetRole },
    });

    await incrementAIUsage(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Skill gap analysis completed',
      targetRole,
      ...parsed,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 5. CAREER PATH SUGGESTIONS
// ============================================================
/**
 * @desc    AI-powered career path suggestions
 * @route   POST /api/ai/career-paths
 * @access  Private
 */
const careerPathSuggestions = async (req, res, next) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'resumeId is required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const systemInstruction = `You are a career counselor and labor market expert with knowledge of current industry trends, 
salary data, and career trajectories. You provide realistic, data-driven career path recommendations. 
Always respond ONLY with valid JSON.`;

    const prompt = `Based on this candidate's resume, suggest 4-5 realistic and suitable career paths.

CANDIDATE'S RESUME:
"""
${resume.parsedText ? resume.parsedText.substring(0, 2500) : `Skills: ${(resume.extractedSkills || []).join(', ')}`}
"""

Consider current market demand, growth potential, and the candidate's existing skills.

Return ONLY a valid JSON object:
{
  "paths": [
    {
      "title": "<career path title e.g., 'Full Stack Developer'>",
      "description": "<2-3 sentence description of this career path and why it fits the candidate>",
      "requiredSkills": [<list of 6-8 key skills needed>],
      "skillsAlreadyHave": [<skills from resume matching this path>],
      "salaryRange": "<e.g., '$75,000 - $130,000 USD/year'>",
      "demandLevel": "<'Very High' | 'High' | 'Medium' | 'Low'>",
      "timeToAchieve": "<e.g., '6-12 months with focused learning'>",
      "nextSteps": [<list of 3-4 immediate next steps>]
    }
  ],
  "topRecommendation": "<title of the single best-fit career path>",
  "reasoning": "<why this recommendation fits best>"
}`;

    const aiResponse = await generateAIResponse(prompt, systemInstruction);
    const parsed = parseAIJSON(aiResponse);

    if (!parsed || !parsed.paths) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate career paths. Please try again.',
      });
    }

    await saveAIReport({
      userId: req.user._id,
      reportType: 'career-paths',
      title: `Career Path Suggestions`,
      content: parsed,
    });

    await incrementAIUsage(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Career paths generated successfully',
      ...parsed,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 6. GENERATE INTERVIEW QUESTIONS
// ============================================================
/**
 * @desc    Generate mock interview questions
 * @route   POST /api/ai/interview-questions
 * @access  Private
 */
const generateInterviewQuestions = async (req, res, next) => {
  try {
    const { targetRole, interviewType = 'mixed', difficulty = 'medium', count = 10 } = req.body;

    if (!targetRole) {
      return res.status(400).json({ success: false, message: 'targetRole is required' });
    }

    const systemInstruction = `You are an experienced technical interviewer and HR professional who creates 
realistic, challenging interview questions. Your questions are specific to the role, industry-standard, 
and provide hints to guide candidates. Always respond ONLY with valid JSON.`;

    const typeDesc = {
      technical: 'technical/coding questions focusing on problem-solving and technical knowledge',
      hr: 'behavioral and situational HR questions using STAR method',
      mixed: 'a mix of technical and behavioral questions',
    };

    const prompt = `Generate ${count} interview questions for a ${targetRole} position.

Interview Type: ${interviewType} - ${typeDesc[interviewType] || typeDesc.mixed}
Difficulty Level: ${difficulty}

Requirements:
- Questions should be realistic and commonly asked in actual interviews
- Include a variety of question types based on interview type
- Provide categorization for each question
- Include helpful hints for each question

Return ONLY a valid JSON object:
{
  "questions": [
    {
      "question": "<the interview question>",
      "category": "<category e.g., 'Data Structures', 'Behavioral', 'System Design', 'Communication'>",
      "difficulty": "<'easy' | 'medium' | 'hard'>",
      "hint": "<helpful hint or what the interviewer is looking for>"
    }
  ],
  "targetRole": "${targetRole}",
  "interviewType": "${interviewType}"
}`;

    const aiResponse = await generateAIResponse(prompt, systemInstruction);
    const parsed = parseAIJSON(aiResponse);

    if (!parsed || !parsed.questions) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate interview questions. Please try again.',
      });
    }

    await saveAIReport({
      userId: req.user._id,
      reportType: 'interview-questions',
      title: `${interviewType} Interview Questions - ${targetRole}`,
      content: parsed,
    });

    await incrementAIUsage(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Interview questions generated successfully',
      ...parsed,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 7. EVALUATE INTERVIEW ANSWER
// ============================================================
/**
 * @desc    Evaluate a candidate's interview answer
 * @route   POST /api/ai/interview-feedback
 * @access  Private
 */
const evaluateInterviewAnswer = async (req, res, next) => {
  try {
    const { question, answer, role } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'question and answer are required',
      });
    }

    if (answer.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Answer is too short for meaningful evaluation',
      });
    }

    const systemInstruction = `You are an expert interviewer evaluating candidate responses. 
You provide balanced, constructive, and specific feedback that helps candidates improve. 
Score answers objectively on a 1-10 scale. Always respond ONLY with valid JSON.`;

    const prompt = `Evaluate the following interview answer for a ${role || 'software engineer'} position.

QUESTION: "${question}"

CANDIDATE'S ANSWER:
"""
${answer}
"""

Evaluate the answer on:
- Accuracy and technical correctness
- Clarity and communication
- Depth and completeness
- Specific examples provided (if behavioral)
- Overall impression

Return ONLY a valid JSON object:
{
  "score": <number 1-10>,
  "feedback": "<comprehensive 3-5 sentence feedback on the answer>",
  "strengths": [<list of 2-4 specific strengths in this answer>],
  "improvements": [<list of 2-4 specific improvement suggestions>],
  "betterApproach": "<brief description of a better approach or what an ideal answer would include>",
  "followUpQuestions": [<list of 2 follow-up questions an interviewer might ask>]
}`;

    const aiResponse = await generateAIResponse(prompt, systemInstruction);
    const parsed = parseAIJSON(aiResponse);

    if (!parsed) {
      return res.status(500).json({
        success: false,
        message: 'Failed to evaluate answer. Please try again.',
      });
    }

    await saveAIReport({
      userId: req.user._id,
      reportType: 'interview-feedback',
      title: `Interview Answer Feedback`,
      content: { ...parsed, question, answer, role },
    });

    await incrementAIUsage(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Answer evaluated successfully',
      ...parsed,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 8. GENERATE LEARNING ROADMAP
// ============================================================
/**
 * @desc    Generate personalized learning roadmap
 * @route   POST /api/ai/learning-roadmap
 * @access  Private
 */
const generateLearningRoadmap = async (req, res, next) => {
  try {
    const { targetRole, currentSkills = [], timeframe = '12 weeks' } = req.body;

    if (!targetRole) {
      return res.status(400).json({ success: false, message: 'targetRole is required' });
    }

    const systemInstruction = `You are a learning and development expert who creates structured, practical learning roadmaps. 
You recommend free and paid resources, prioritize topics based on job market requirements, and set realistic milestones.
Always respond ONLY with valid JSON.`;

    const prompt = `Create a comprehensive ${timeframe} learning roadmap for someone wanting to become a ${targetRole}.

Current Skills: ${currentSkills.length > 0 ? currentSkills.join(', ') : 'Beginner level, no specific skills mentioned'}
Target Role: ${targetRole}
Timeframe: ${timeframe}

Create a week-by-week learning plan that:
- Builds skills progressively
- Includes practical projects and exercises
- Recommends specific, high-quality resources (real URLs when possible)
- Is realistic and achievable

Return ONLY a valid JSON object:
{
  "roadmap": [
    {
      "week": <week number>,
      "topic": "<topic title>",
      "description": "<what will be learned and why it's important>",
      "resources": [
        {
          "title": "<resource name>",
          "url": "<URL or 'Search: keyword'>",
          "type": "<'video' | 'article' | 'course' | 'book' | 'practice'>"
        }
      ],
      "practiceTask": "<specific hands-on task for this week>"
    }
  ],
  "targetRole": "${targetRole}",
  "timeframe": "${timeframe}",
  "prerequisites": [<skills needed before starting>],
  "finalProjectIdea": "<capstone project idea to showcase learned skills>"
}`;

    const aiResponse = await generateAIResponse(prompt, systemInstruction);
    const parsed = parseAIJSON(aiResponse);

    if (!parsed || !parsed.roadmap) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate roadmap. Please try again.',
      });
    }

    await saveAIReport({
      userId: req.user._id,
      reportType: 'learning-roadmap',
      title: `Learning Roadmap - ${targetRole}`,
      content: parsed,
    });

    await incrementAIUsage(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Learning roadmap generated successfully',
      ...parsed,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 9. GENERATE PROJECT IDEAS
// ============================================================
/**
 * @desc    Generate portfolio project ideas
 * @route   POST /api/ai/project-ideas
 * @access  Private
 */
const generateProjectIdeas = async (req, res, next) => {
  try {
    const { skills = [], targetRole } = req.body;

    if (!targetRole && skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one of skills or targetRole is required',
      });
    }

    const systemInstruction = `You are a senior software engineer and technical mentor who suggests portfolio projects 
that impress hiring managers. You recommend projects that are practical, demonstrable, and demonstrate real-world skills.
Always respond ONLY with valid JSON.`;

    const prompt = `Generate 6 impressive portfolio project ideas for someone with the following profile:

Skills: ${skills.length > 0 ? skills.join(', ') : 'General programming skills'}
Target Role: ${targetRole || 'Software Developer'}

Projects should:
- Be relevant to the target role and industry
- Showcase a variety of skills (some easy, some challenging)
- Be unique and stand out from typical tutorial projects
- Have clear, demonstrable features for a portfolio

Return ONLY a valid JSON object:
{
  "projects": [
    {
      "title": "<project name>",
      "description": "<2-3 sentence description of what the project does and its impact>",
      "techStack": [<list of technologies/frameworks to use>],
      "difficulty": "<'beginner' | 'intermediate' | 'advanced'>",
      "estimatedTime": "<e.g., '2-3 weeks'>",
      "keyFeatures": [<list of 4-5 main features to implement>],
      "githubTopics": [<list of GitHub topics/tags for discoverability>],
      "impactStatement": "<why this project will impress recruiters>"
    }
  ],
  "targetRole": "${targetRole || 'Software Developer'}",
  "tip": "<general tip for building a strong portfolio>"
}`;

    const aiResponse = await generateAIResponse(prompt, systemInstruction);
    const parsed = parseAIJSON(aiResponse);

    if (!parsed || !parsed.projects) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate project ideas. Please try again.',
      });
    }

    await saveAIReport({
      userId: req.user._id,
      reportType: 'project-ideas',
      title: `Project Ideas - ${targetRole || 'Software Developer'}`,
      content: parsed,
    });

    await incrementAIUsage(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Project ideas generated successfully',
      ...parsed,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 10. GENERATE WEEKLY REPORT
// ============================================================
/**
 * @desc    Generate personalized weekly progress report
 * @route   POST /api/ai/weekly-report
 * @access  Private
 */
const generateWeeklyReport = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get start of current week (Monday)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    // Aggregate activity from the past week in parallel
    const [
      recentInterviews,
      recentReports,
      learningPlan,
      resumeCount,
      user,
    ] = await Promise.all([
      InterviewHistory.find({
        userId,
        createdAt: { $gte: weekStart },
      }).select('sessionTitle overallScore interviewType targetRole completedAt'),

      AIReport.find({
        userId,
        createdAt: { $gte: weekStart },
      }).select('reportType title createdAt'),

      LearningPlan.findOne({ userId }).select(
        'targetRole progressPercentage roadmap currentSkills skillGaps'
      ),

      Resume.countDocuments({ userId, isActive: true }),

      User.findById(userId).select('name aiUsageCount createdAt'),
    ]);

    // Calculate interview stats
    const avgInterviewScore =
      recentInterviews.length > 0
        ? Math.round(
            recentInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) /
              recentInterviews.length
          )
        : 0;

    // Build activity summary for AI
    const activitySummary = {
      userName: user.name,
      weekInterviews: recentInterviews.length,
      avgInterviewScore,
      aiReportsGenerated: recentReports.length,
      totalAIUsage: user.aiUsageCount,
      resumesOnFile: resumeCount,
      learningProgress: learningPlan ? learningPlan.progressPercentage : 0,
      targetRole: learningPlan ? learningPlan.targetRole : 'Not set',
      skillGaps: learningPlan ? learningPlan.skillGaps.slice(0, 5) : [],
      reportTypes: [...new Set(recentReports.map((r) => r.reportType))],
    };

    const systemInstruction = `You are a career coach creating personalized weekly progress reports for students.
You are encouraging, specific, and actionable. You celebrate achievements and provide constructive guidance.
Always respond ONLY with valid JSON.`;

    const prompt = `Generate a personalized weekly career progress report for this student.

STUDENT ACTIVITY THIS WEEK:
${JSON.stringify(activitySummary, null, 2)}

Create an encouraging, personalized report that:
- Acknowledges specific achievements from this week
- Identifies areas for improvement
- Sets clear, achievable goals for next week
- Includes a motivational message tailored to their situation

Return ONLY a valid JSON object:
{
  "report": {
    "greeting": "<personalized greeting using their name>",
    "summary": "<2-3 sentence summary of this week's career journey>",
    "achievements": [<list of 3-5 specific achievements this week, based on their activity>],
    "improvements": [<list of 2-3 areas where they can do better>],
    "nextWeekGoals": [<list of 3-4 specific, actionable goals for next week>],
    "motivationalMessage": "<personalized 2-3 sentence motivational message>",
    "weekScore": <number 0-100 representing overall activity level>,
    "tip": "<one practical career tip relevant to their situation>"
  }
}`;

    const aiResponse = await generateAIResponse(prompt, systemInstruction);
    const parsed = parseAIJSON(aiResponse);

    if (!parsed || !parsed.report) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate weekly report. Please try again.',
      });
    }

    await saveAIReport({
      userId,
      reportType: 'weekly-report',
      title: `Weekly Progress Report - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      content: { ...parsed, activitySummary },
    });

    await incrementAIUsage(userId);

    res.status(200).json({
      success: true,
      message: 'Weekly report generated successfully',
      ...parsed,
      activitySummary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResume,
  generateSummary,
  generateCoverLetter,
  skillGapAnalysis,
  careerPathSuggestions,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  generateLearningRoadmap,
  generateProjectIdeas,
  generateWeeklyReport,
};
