const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AppError } = require('../utils/error');

/**
 * Gemini service for generating summaries
 */
class GeminiService {
  constructor() {
    // Initialize the Google Generative AI client
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
    });
  }

  /**
   * Generate a summary of a video transcript
   * @param {Object} options - Options for summary generation
   * @param {string} options.transcript - Video transcript
   * @param {string} options.title - Video title
   * @param {string} options.summaryType - Type of summary (Brief, Detailed, Key Point)
   * @param {string} options.summaryLength - Length of summary (Short, Medium, Long)
   * @returns {Promise<string>} - Generated summary
   */
  async generateSummary({ transcript, title, summaryType = 'Brief', summaryLength = 'Medium' }) {
    try {
      if (!transcript) {
        throw new AppError('Transcript is required for summary generation', 400);
      }

      // Create the prompt based on summary type and length
      const prompt = this.createPrompt({
        transcript,
        title,
        summaryType,
        summaryLength
      });

      // Generate the summary using Gemini
      const generationConfig = {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain',
      };

      const chatSession = this.model.startChat({
        generationConfig,
        history: [],
      });

      const result = await chatSession.sendMessage(prompt);
      const summary = result.response.text();

      if (!summary) {
        throw new AppError('Failed to generate summary', 500);
      }

      return summary;
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw new AppError(`Failed to generate summary: ${error.message}`, 500);
    }
  }

  /**
   * Create a prompt for Gemini based on summary type and length
   * @param {Object} options - Options for prompt creation
   * @param {string} options.transcript - Video transcript
   * @param {string} options.title - Video title
   * @param {string} options.summaryType - Type of summary (Brief, Detailed, Key Point)
   * @param {string} options.summaryLength - Length of summary (Short, Medium, Long)
   * @returns {string} - Generated prompt
   */
  createPrompt({ transcript, title, summaryType, summaryLength }) {
    // Define length parameters based on summaryLength
    let lengthInstruction = '';
    switch (summaryLength) {
      case 'Short':
        lengthInstruction = 'Keep the summary concise, around 100-150 words.';
        break;
      case 'Medium':
        lengthInstruction = 'Provide a moderate-length summary, around 200-300 words.';
        break;
      case 'Long':
        lengthInstruction = 'Create a comprehensive summary, around 400-600 words.';
        break;
      default:
        lengthInstruction = 'Provide a moderate-length summary, around 200-300 words.';
    }

    // Define type instructions based on summaryType
    let typeInstruction = '';
    switch (summaryType) {
      case 'Brief':
        typeInstruction = 'Create a brief overview of the main points and conclusions.';
        break;
      case 'Detailed':
        typeInstruction = 'Provide a detailed summary covering all significant points, arguments, and examples.';
        break;
      case 'Key Point':
        typeInstruction = 'Extract and list the key points and takeaways in a structured format.';
        break;
      default:
        typeInstruction = 'Create a brief overview of the main points and conclusions.';
    }

    // Construct the full prompt
    const titleSection = title ? `Title: ${title}\n\n` : '';
    
    return `
You are an expert at summarizing YouTube video content. Your task is to create a high-quality summary of the following video transcript.

${titleSection}
${typeInstruction}
${lengthInstruction}

Format the summary in Markdown with appropriate headings, bullet points, and emphasis where needed.

Here is the transcript:

${transcript}

Summary:
`;
  }
}

module.exports = new GeminiService();
