import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Groq API connection...');
console.log('API Key exists:', !!process.env.GROQ_API_KEY);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function test() {
  try {
    console.log('Making test API call...');
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond with a simple yes or no.'
        },
        {
          role: 'user',
          content: 'Is this working?'
        }
      ],
      temperature: 0.1,
      max_tokens: 50
    });
    console.log('Response:', completion.choices[0]?.message?.content);
    console.log('✅ API test successful!');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.error('Error type:', error.name);
    console.error('Full error:', error);
  }
}

test();
