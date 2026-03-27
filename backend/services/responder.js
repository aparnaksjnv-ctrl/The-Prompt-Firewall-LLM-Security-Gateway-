import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const RESPONDER_MODEL = 'llama3-70b-8192';

export async function getResponse(userInput, conversationHistory = []) {
  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user queries. Be concise but thorough.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userInput
      }
    ];

    const completion = await groq.chat.completions.create({
      model: RESPONDER_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content from responder LLM');
    }

    return {
      success: true,
      response: content,
      model: RESPONDER_MODEL,
      usage: completion.usage
    };
  } catch (error) {
    console.error('Responder LLM error:', error);
    return {
      success: false,
      error: error.message,
      response: 'I apologize, but I encountered an error processing your request. Please try again.'
    };
  }
}
