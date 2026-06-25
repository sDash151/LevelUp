import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Adjust depending on run dir

async function testEmbeddings() {
  const keyString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
  const keys = keyString ? keyString.split(',').map(k => k.trim()).filter(Boolean) : [];
  
  if (keys.length === 0) {
    console.error("No API keys found");
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey: keys[0] });
  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2', // Found this in available models
      contents: ['Bench Press', 'Squat'],
    });
    console.log("text-embedding-004 works!");
    console.log(response.embeddings.map(e => e.values.length));
  } catch (err) {
    try {
      console.log("Fallback to text-embedding-004 didn't work. Trying text-embedding-004 with REST api...");
    } catch (e) {
      console.error(e);
    }
  }
}

testEmbeddings();
