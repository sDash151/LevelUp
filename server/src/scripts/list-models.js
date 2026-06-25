import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Adjust depending on run dir

async function listModels() {
  const keyString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
  const keys = keyString ? keyString.split(',').map(k => k.trim()).filter(Boolean) : [];
  
  if (keys.length === 0) {
    console.error("No API keys found");
    return;
  }
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keys[0]}`);
    const data = await response.json();
    console.log(data.models.map(m => m.name).filter(n => n.includes('embed')));
  } catch (err) {
    console.error(err);
  }
}

listModels();
