// Quick test for advanced options functionality
const { generatePrompt } = require('./lib/aiGeneration');

// Test basic prompt generation
console.log("=== Basic Prompt ===");
console.log(generatePrompt("test-website"));

console.log("\n=== Advanced Options Prompt ===");
console.log(generatePrompt("test-website", {
  style: "modern minimalist",
  content: "product showcase",
  topic: "tech startup"
}));

console.log("\n=== Partial Advanced Options ===");
console.log(generatePrompt("test-website", {
  style: "retro gaming",
  topic: "arcade games"
}));
