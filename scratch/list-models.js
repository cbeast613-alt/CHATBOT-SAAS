const fs = require('fs');

async function listModels() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const key = envContent.match(/GEMINI_API_KEY=(.*)/)[1].trim();
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log("Available Models:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();
