async function run() {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY);
  const data = await res.json();
  const models = data.models ? data.models.map(m => m.name).filter(m => !m.includes('preview')).join('\n') : JSON.stringify(data);
  console.log(models);
}
run();
