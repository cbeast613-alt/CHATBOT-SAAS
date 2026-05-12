const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There is no direct 'listModels' on the main object in this lib version usually, 
    // it's an API call. But let's try a simple generation to see what works.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("hi");
    console.log("Success with gemini-1.5-flash:", result.response.text());
  } catch (err) {
    console.error("Error with gemini-1.5-flash:", err.message);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("hi");
    console.log("Success with gemini-pro:", result.response.text());
  } catch (err) {
    console.error("Error with gemini-pro:", err.message);
  }
}

listModels();
