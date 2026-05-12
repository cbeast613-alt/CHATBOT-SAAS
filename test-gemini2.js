const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  try {
    const result = await model.generateContent("hello");
    console.log("flash success:", result.response.text());
  } catch (e) {
    console.error("flash error:", e.message);
  }
}
run();
