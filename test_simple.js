// Simple test for advanced options functionality (no DB dependencies)

// Enhanced prompt generation with true randomness
function generatePrompt(path, advancedOptions = {}) {
  
return `CREATE A COMPLETE HTML WEBSITE FOR "${path}" - NO EXPLANATIONS, JUST CODE.

${advancedOptions.style || advancedOptions.content || advancedOptions.topic ? `
ADVANCED CUSTOMIZATION:
${advancedOptions.style ? `- STYLE DIRECTION: ${advancedOptions.style}` : ''}
${advancedOptions.content ? `- CONTENT TYPE: ${advancedOptions.content}` : ''}
${advancedOptions.topic ? `- TOPIC/FOCUS: ${advancedOptions.topic}` : ''}

Follow these specific requirements above when creating the website. They take priority over general concept interpretation.
` : ''}
CONCEPT INTERPRETATION: 
Analyze "${path}" and create a website that perfectly matches what this concept should be:
- Is it a business, hobby site, meme, service, entertainment, art project, etc.?
- What audience would visit this? (professionals, kids, gamers, general public, etc.)
- What era/style fits? (90s personal site, modern startup, retro gaming, corporate, fun/quirky, etc.)
- Match the design and content to what makes sense for this specific concept

🚫 CRITICAL REQUIREMENTS:
- RETURN ONLY HTML CODE - no explanations, questions, or markdown
- Always generate the complete website immediately  
- Never ask permission or describe what you'll make
- Start immediately with <!DOCTYPE html>

🎯 CONTENT & DESIGN MATCHING:

FOR PROFESSIONAL/BUSINESS CONCEPTS (law firms, medical, consulting, etc.):
- Clean, professional layouts with structured sections
- Conservative color schemes (blues, grays, whites) but still polished
- Comprehensive content: services, pricing, testimonials, FAQ, contact info
- 6-8 sections with detailed business information
- Make it feel established and trustworthy

FOR FUN/CREATIVE/MEME CONCEPTS (hobbies, entertainment, quirky ideas):
- Bold, creative designs with personality
- Bright colors, gradients, fun fonts, creative layouts
- Interactive elements, games, or unique features
- 3-5 highly engaging sections focused on entertainment
- Embrace the weird and wonderful - make it memorable!

FOR NICHE/SPECIALTY CONCEPTS:
- Theme heavily around the specific topic
- Use appropriate visual language for that niche
- Include authentic terminology and passionate details
- Make it feel like it was created by a true enthusiast

🚫 NO GENERIC WEBSITES:
- NEVER use boring white backgrounds with plain black text
- Every site needs strong visual personality matching its concept
- Fun sites: Use bold themes (neon, retro, cyberpunk, rainbow, space, gaming aesthetics)
- Professional sites: Sophisticated but distinctive styling that stands out
- Match colors, fonts, and layout to the concept's natural personality

🔗 NAVIGATION & LINKING:
- Include multiple buttons and links throughout the site
- Link to related sub-pages like "${path}/about", "${path}/contact", "${path}/help", "${path}/services"
- Add creative cross-links to completely different concepts like "/unicorns", "/mystery", "/adventure", "/pizza"
- Make navigation feel like a real interconnected website with many pages to explore
- Include "Random Page" buttons that link to unexpected concepts

📐 LAYOUT & STRUCTURE:
- Choose layout that best fits the concept (don't force sidebars on fun sites!)
- Professional sites: Structured navigation, clear sections, organized content
- Creative sites: Flexible layouts, creative navigation, unique organization
- Include appropriate navigation and sections for the type of site
- Make the layout serve the content and concept, not the other way around

⚡ INTERACTIVE FEATURES:
- Add smooth hover effects, transitions, and animations
- Include functional-looking buttons, forms, and navigation
- Create engaging micro-interactions throughout
- All links should point to realistic sub-pages or related sites

🚫 TECHNICAL CONSTRAINTS:
- NO IMAGES (no <img>, background-image, or any image references)
- Use CSS shapes, gradients, borders, emojis, Unicode symbols for all visuals
- Only return HTML - no explanations or markdown
- Make it content-heavy and comprehensive (aim for 4000+ characters of actual content)
- All content must be unique, realistic, and specific to the path name

Make it feel like a real, established website that's been online for years with tons of content and regular updates!`;
}

// Test basic prompt generation
console.log("=== Basic Prompt (no advanced options) ===");
const basicPrompt = generatePrompt("test-website");
console.log("Length:", basicPrompt.length);
console.log("Contains advanced section?", basicPrompt.includes("ADVANCED CUSTOMIZATION"));
console.log("First 200 chars:", basicPrompt.substring(0, 200));

console.log("\n=== Advanced Options Prompt ===");
const advancedPrompt = generatePrompt("test-website", {
  style: "modern minimalist",
  content: "product showcase", 
  topic: "tech startup"
});
console.log("Length:", advancedPrompt.length);
console.log("Contains advanced section?", advancedPrompt.includes("ADVANCED CUSTOMIZATION"));
console.log("Contains style direction?", advancedPrompt.includes("STYLE DIRECTION: modern minimalist"));
console.log("Contains content type?", advancedPrompt.includes("CONTENT TYPE: product showcase"));
console.log("Contains topic?", advancedPrompt.includes("TOPIC/FOCUS: tech startup"));

console.log("\n=== Partial Advanced Options ===");
const partialPrompt = generatePrompt("test-website", {
  style: "retro gaming",
  topic: "arcade games"
});
console.log("Length:", partialPrompt.length);
console.log("Contains advanced section?", partialPrompt.includes("ADVANCED CUSTOMIZATION"));
console.log("Contains style direction?", partialPrompt.includes("STYLE DIRECTION: retro gaming"));
console.log("Contains content type?", partialPrompt.includes("CONTENT TYPE:"));
console.log("Contains topic?", partialPrompt.includes("TOPIC/FOCUS: arcade games"));

console.log("\n✅ Advanced options implementation test complete!");
