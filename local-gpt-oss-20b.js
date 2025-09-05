// Simple example to test a locally served gpt-oss-20b model (vLLM / Transformers Serve / Ollama OpenAI-compatible)
// Usage:
//   1. Start your local server exposing an OpenAI-compatible chat endpoint.
//      Examples:
//        vLLM: vllm serve openai/gpt-oss-20b
//        Transformers: transformers serve --model openai/gpt-oss-20b
//        Ollama (after enabling OpenAI compatibility): ollama run gpt-oss:20b
//   2. Set env vars (or edit below):
//        MODEL_PROVIDER=local
//        MODEL_API_BASE=http://localhost:8000/v1   (vLLM / Transformers)
//        MODEL_NAME=openai/gpt-oss-20b             (or gpt-oss:20b for Ollama)
//   3. Run: node local-gpt-oss-20b.js

require('dotenv').config();
const axios = require('axios');

async function main() {
  const base = process.env.MODEL_API_BASE || 'http://localhost:8000/v1';
  const model = process.env.MODEL_NAME || 'openai/gpt-oss-20b';
  const apiKey = process.env.MODEL_API_KEY; // optional

  console.log(`Testing local model: ${model} at ${base}`);

  try {
    const resp = await axios.post(`${base}/chat/completions`, {
      model,
      max_tokens: 256,
      messages: [
        { role: 'system', content: 'You are a concise assistant.' },
        { role: 'user', content: 'Give me 3 imaginative startup ideas in one line each.' }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
      }
    });

    const out = resp.data.choices?.[0]?.message?.content || '[No content]';
    console.log('\n=== Model Output ===\n');
    console.log(out.trim());
  } catch (err) {
    console.error('Local model request failed:\n', err.response?.data || err.message);
  }
}

main();
