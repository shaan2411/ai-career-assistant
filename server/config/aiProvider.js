/**
 * config/aiProvider.js — Modular AI Provider
 *
 * Supports switching between Google Gemini and OpenAI via the AI_PROVIDER env variable.
 * Set AI_PROVIDER=gemini (default) or AI_PROVIDER=openai in your .env file.
 *
 * Fallback: Includes a mock generator to dynamically return realistic structured JSON replies
 * when Gemini/OpenAI API keys are invalid, placeholder, or not supplied.
 */

require('dotenv').config();

const PROVIDER = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

// ─── Mock Response Generator ──────────────────────────────────────────────────
const getMockResponse = (prompt) => {
  const promptLower = prompt.toLowerCase();

  if (promptLower.includes('analyze the following resume text') || promptLower.includes('comprehensive evaluation')) {
    return JSON.stringify({
      score: 85,
      strengths: [
        'Clear structure and easily readable format',
        'Strong technical stack matches modern standards',
        'Demonstrates good teamwork and project experiences'
      ],
      weaknesses: [
        'Lack of quantified achievements in experience descriptions',
        'Professional summary could be more concise',
        'No certifications or specific tools mentioned'
      ],
      suggestions: [
        'Add quantitative metrics (e.g., "improved load time by 30%")',
        'Tailor your summary to target roles specifically',
        'Include links to active portfolio projects',
        'Highlight leadership roles in group projects',
        'Include certifications like AWS or React Developer'
      ],
      keywords: ['JavaScript', 'React.js', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'Git', 'HTML5', 'CSS3'],
      atsCompatibility: 'Good - Core keyword match is robust, but needs more metrics.',
      overallVerdict: 'This is a solid resume showing strong foundational developer skills. Optimizing it with measurable performance achievements will significantly improve response rates from hiring managers.'
    });
  }

  if (promptLower.includes('professional summary') || promptLower.includes('sentence professional summary')) {
    return JSON.stringify({
      summary: 'Passionate and detail-oriented Full-Stack Developer with experience building responsive web applications using React, Node.js, and MongoDB. Proven ability to optimize application performance and collaborate in agile team environments.',
      keyHighlights: [
        'Proficient in MERN Stack',
        'Experienced with RESTful APIs',
        'Solid Git version control workflows'
      ]
    });
  }

  if (promptLower.includes('cover letter')) {
    return JSON.stringify({
      coverLetter: 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the open position. With my background in full-stack development and practical experience building web applications, I am confident in my ability to contribute value to your team.\n\nThroughout my projects, I have specialized in building responsive interfaces with React and scaling backend routes using Node.js and Express. I look forward to bringing these skills to your organization.\n\nThank you for your consideration.\n\nSincerely,\nCandidate',
      matchedSkills: ['React', 'Node.js', 'REST APIs'],
      tone: 'Professional and eager'
    });
  }

  if (promptLower.includes('skill gap') || promptLower.includes('readinessscore') || promptLower.includes('skills gap')) {
    return JSON.stringify({
      currentSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
      missingSkills: ['Node.js', 'MongoDB', 'System Design', 'Docker'],
      prioritySkills: ['Node.js', 'MongoDB', 'REST API Design', 'TypeScript'],
      niceToHaveSkills: ['Docker', 'AWS Basics'],
      estimatedTime: '2-3 months of focused learning',
      readinessScore: 70,
      recommendations: [
        'Complete a backend course focusing on Express.js',
        'Build and deploy a full-stack project',
        'Learn database indexing and schema design'
      ]
    });
  }

  if (promptLower.includes('career path') || promptLower.includes('career-paths')) {
    return JSON.stringify({
      paths: [
        {
          title: 'Frontend Developer',
          description: 'Focus on building interactive, user-facing UI components using modern design libraries.',
          requiredSkills: ['React', 'TypeScript', 'CSS/Bootstrap', 'Testing'],
          skillsAlreadyHave: ['React', 'JavaScript', 'HTML', 'CSS'],
          salaryRange: '$70,000 - $110,000 USD/year',
          demandLevel: 'High',
          timeToAchieve: '1-2 months',
          nextSteps: ['Learn TypeScript', 'Build a React library component']
        },
        {
          title: 'Full Stack Engineer',
          description: 'Integrate database servers, client routers, and server-side route definitions.',
          requiredSkills: ['React', 'Node.js', 'MongoDB', 'System Design'],
          skillsAlreadyHave: ['React', 'JavaScript'],
          salaryRange: '$85,000 - $130,000 USD/year',
          demandLevel: 'Very High',
          timeToAchieve: '3-4 months',
          nextSteps: ['Build Node.js server routes', 'Learn MongoDB aggregates']
        }
      ],
      topRecommendation: 'Frontend Developer',
      reasoning: 'The candidate already possesses excellent CSS/HTML/JS base layout skills, making Frontend Developer the fastest entry point.'
    });
  }

  if (promptLower.includes('interview questions') || promptLower.includes('questions for a')) {
    return JSON.stringify({
      questions: [
        { question: 'What is the virtual DOM in React and how does it work?', category: 'Technical', difficulty: 'medium', hint: 'Think about diffing algorithm and browser paint operations.' },
        { question: 'Describe a challenging project you worked on and how you resolved a team conflict.', category: 'Behavioral', difficulty: 'medium', hint: 'Use the STAR method: Situation, Task, Action, Result.' },
        { question: 'What is middleware in Express.js and when would you use it?', category: 'Technical', difficulty: 'medium', hint: 'Think about request/response lifecycles, authentication, logging.' }
      ],
      targetRole: 'Software Developer',
      interviewType: 'mixed'
    });
  }

  if (promptLower.includes('evaluate the following interview answer') || promptLower.includes('candidate\'s answer')) {
    return JSON.stringify({
      score: 8,
      feedback: 'Excellent answer displaying clear conceptual understanding. You explained the main points logically.',
      strengths: ['Clear terminology', 'Structured response'],
      improvements: ['Include a code example or real scenario', 'Keep it slightly more concise'],
      betterApproach: 'Start with a high-level definition, then give an example of optimization, and end with the benefit.',
      followUpQuestions: ['How do you handle pagination in MongoDB?', 'How does indexing affect write operations?']
    });
  }

  if (promptLower.includes('learning roadmap') || promptLower.includes('week-by-week learning plan')) {
    return JSON.stringify({
      roadmap: [
        {
          week: 1,
          topic: 'Node.js & Express Fundamentals',
          description: 'Learn asynchronous JS execution, event loops, and setting up basic HTTP routes.',
          resources: [
            { title: 'Node.js Crash Course', url: 'https://youtube.com', type: 'video' },
            { title: 'Express.js Getting Started', url: 'https://expressjs.com', type: 'article' }
          ],
          practiceTask: 'Build a server that reads and writes a JSON file.'
        },
        {
          week: 2,
          topic: 'MongoDB Integration',
          description: 'Learn database connection, Mongoose schemas, and standard CRUD procedures.',
          resources: [
            { title: 'MongoDB Mongoose Course', url: 'https://mongodb.com', type: 'course' }
          ],
          practiceTask: 'Connect your Express server to MongoDB and save user details.'
        }
      ],
      targetRole: 'Full Stack Developer',
      timeframe: '8 Weeks',
      prerequisites: ['JavaScript ES6', 'HTML/CSS'],
      finalProjectIdea: 'A full-stack portfolio dashboard with complete CRUD support.'
    });
  }

  if (promptLower.includes('project ideas') || promptLower.includes('portfolio project ideas')) {
    return JSON.stringify({
      projects: [
        {
          title: 'AI Study Assistant Dashboard',
          description: 'A platform providing customized study cards and roadmaps using generative intelligence.',
          techStack: ['React', 'Node.js', 'Express', 'MongoDB'],
          difficulty: 'intermediate',
          estimatedTime: '2-3 weeks',
          keyFeatures: ['User Auth', 'Gemini Integration', 'Study Tracking dashboard'],
          githubTopics: ['react', 'nodejs', 'mongodb', 'gemini-ai'],
          impactStatement: 'Recruiters will be impressed by your integration of AI services and state management.'
        }
      ],
      targetRole: 'Full Stack Developer',
      tip: 'Focus on quality of code and deployment rather than quantity of projects.'
    });
  }

  if (promptLower.includes('weekly career readiness') || promptLower.includes('weekly progress report') || promptLower.includes('weekly-report')) {
    return JSON.stringify({
      report: {
        summary: 'Great progress this week! You uploaded your resume and practiced mock interviews.',
        achievements: [
          'Successfully uploaded resume',
          'Achieved a mock interview score of 8/10'
        ],
        improvements: [
          'Add quantified metrics to your experience section',
          'Practice more system design questions'
        ],
        nextWeekGoals: [
          'Complete Week 2 of your Node.js roadmap',
          'Apply to 3 recommended job listings'
        ],
        motivationalMessage: 'Keep pushing forward! Consistency is the key to landing your dream tech role.'
      }
    });
  }

  return JSON.stringify({
    success: true,
    message: 'Mock response generated successfully.'
  });
};

// ─── Gemini Provider ──────────────────────────────────────────────────────────

const createGeminiProvider = () => {
  const { GoogleGenerativeAI } = require('@google/generative-ai');

  if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn('⚠️  GOOGLE_AI_API_KEY is not set. Gemini AI features will use fallback mock responses.');
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

  /**
   * Generate a response using Google Gemini 1.5 Flash
   */
  const generateAIResponse = async (prompt, systemInstruction = '') => {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction || 'You are a helpful AI career assistant.',
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error.message);
      if (
        error.message.includes('API key') ||
        error.message.includes('API_KEY') ||
        !process.env.GOOGLE_AI_API_KEY ||
        process.env.GOOGLE_AI_API_KEY.includes('your_gemini_api_key_here')
      ) {
        console.warn('🔄 Falling back to mock response...');
        return getMockResponse(prompt);
      }
      throw new Error(`Gemini AI request failed: ${error.message}`);
    }
  };

  return { generateAIResponse, name: 'Google Gemini 1.5 Flash' };
};

// ─── OpenAI Provider ──────────────────────────────────────────────────────────

const createOpenAIProvider = () => {
  const OpenAI = require('openai');

  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY is not set. OpenAI features will use fallback mock responses.');
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

  /**
   * Generate a response using OpenAI GPT-3.5 Turbo
   */
  const generateAIResponse = async (prompt, systemInstruction = '') => {
    try {
      const messages = [];

      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }
      messages.push({ role: 'user', content: prompt });

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error.message);
      if (
        error.message.includes('API key') ||
        error.message.includes('API_KEY') ||
        !process.env.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY.includes('your_openai_api_key_here')
      ) {
        console.warn('🔄 Falling back to mock response...');
        return getMockResponse(prompt);
      }
      throw new Error(`OpenAI request failed: ${error.message}`);
    }
  };

  return { generateAIResponse, name: 'OpenAI GPT-3.5 Turbo' };
};

// ─── Provider Selection ───────────────────────────────────────────────────────

let provider;

if (PROVIDER === 'openai') {
  provider = createOpenAIProvider();
  console.log('🤖 AI Provider: OpenAI GPT-3.5 Turbo');
} else {
  provider = createGeminiProvider();
  console.log('🤖 AI Provider: Google Gemini 1.5 Flash');
}

/**
 * Parse JSON from AI response, handling markdown code blocks.
 */
const parseAIJson = (text) => {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');

  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  return JSON.parse(cleaned);
};

module.exports = {
  generateAIResponse: provider.generateAIResponse,
  getProvider: () => ({ name: provider.name, type: PROVIDER }),
  parseAIJson,
};
