import { GoogleGenerativeAI } from '@google/generative-ai';

const MAX_TEXT_LENGTH = 15000; // Limit to avoid token overflow

/**
 * Generate revision notes and a 5-question MCQ quiz from extracted lecture text.
 * Uses Google Gemini model.
 */
export async function generateStudyMaterial(text) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in server/.env');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    }
  });

  // Truncate very long text to avoid token limits
  const truncatedText = text.length > MAX_TEXT_LENGTH
    ? text.substring(0, MAX_TEXT_LENGTH) + '\n\n[Content truncated due to length...]'
    : text;

  const prompt = `You are an expert academic tutor. Your job is to create study materials from lecture content provided by the student. You must ONLY use information from the provided material — never add external information or hallucinate facts.

Return your response as a valid JSON object with exactly two keys:
1. "notes" — A markdown-formatted string containing concise revision notes
2. "quiz" — An array of exactly 5 MCQ question objects

For the NOTES, follow these rules:
- Use clear markdown headings (##, ###) to organize by topic
- Use bullet points for key concepts
- Include a "Key Definitions" section if the material contains important terms
- Include a "Key Formulas / Important Points" section if applicable
- Remove unnecessary filler and verbose explanations
- Keep it concise but comprehensive — useful for quick exam revision
- Use bold (**text**) for important terms

For the QUIZ, each question object must have:
- "question": The question text (string)
- "options": Array of exactly 4 answer options (strings)
- "correctIndex": Index (0-3) of the correct answer
- "explanation": A short 1-2 sentence explanation of why the correct answer is correct

Quiz rules:
- Generate exactly 5 questions
- Questions must be based ONLY on the provided material
- Mix conceptual understanding questions with factual recall questions
- Make incorrect options plausible but clearly wrong
- Ensure questions cover different parts of the material

Example response format:
{
  "notes": "## Topic Name\\n\\n- Key point 1\\n- Key point 2\\n\\n### Key Definitions\\n\\n- **Term**: Definition\\n\\n### Key Formulas\\n\\n- Formula: E = mc²",
  "quiz": [
    {
      "question": "What is...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Option A is correct because..."
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no markdown code fences, no additional text.

Here is the lecture material to create study notes and a quiz from:

---

${truncatedText}`;

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    if (!content) {
      throw new Error('AI returned an empty response.');
    }

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseErr) {
      // Try to extract JSON from the response if it's wrapped in code fences
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI returned malformed data.');
      }
    }

    // Validate the response structure
    if (!parsed.notes || typeof parsed.notes !== 'string') {
      throw new Error('AI response missing revision notes.');
    }

    if (!parsed.quiz || !Array.isArray(parsed.quiz) || parsed.quiz.length < 1) {
      throw new Error('AI response missing quiz questions.');
    }

    // Validate each quiz question
    const validatedQuiz = parsed.quiz.slice(0, 5).map((q, i) => ({
      question: q.question || `Question ${i + 1}`,
      options: Array.isArray(q.options) && q.options.length === 4
        ? q.options
        : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3
        ? q.correctIndex
        : 0,
      explanation: q.explanation || 'No explanation provided.',
    }));

    return {
      notes: parsed.notes,
      quiz: validatedQuiz,
    };
  } catch (err) {
    if (err.message.includes('API key')) {
      throw new Error('Invalid Gemini API key. Please check your configuration in server/.env');
    }
    throw new Error(`AI generation failed: ${err.message}`);
  }
}
