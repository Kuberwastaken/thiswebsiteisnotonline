const axios = require('axios');
const { postProcessContent } = require('./postProcessing');

// Enhanced prompt generation with true randomness
function generatePrompt(path) {
  
return `CREATE A COMPLETE HTML WEBSITE - NO EXPLANATIONS, JUST CODE.

First analyze "${path}" to understand what type of website this should be, then build it immediately.

CONCEPT ANALYSIS:
- Understand what "${path}" represents and create a website that makes perfect sense for that concept
- Be creative in your interpretation but ensure it feels authentic and logical
- The design, content, and functionality should all serve the core concept naturally

CRITICAL REQUIREMENTS:
- RETURN ONLY HTML CODE - no explanations, questions, or markdown
- Always generate the complete website immediately
- Never ask permission or describe what you'll make

DESIGN MATCHING:
NO GENERIC WEBSITES - every site must have strong visual personality and theming
Never use plain white backgrounds with basic colored text - that's boring and generic
For fun/creative concepts: Embrace bold themes like retrowave, cyberpunk, neon aesthetics, rainbow gradients, space themes, retro gaming, vaporwave, matrix-style terminals, unicorn pastels, or any other striking visual identity
For professional concepts: Still avoid generic styling - use sophisticated color schemes, elegant typography, and polished design that stands out
Match the visual style to enhance and amplify the concept's personality

NAVIGATION & LINKING:
- Include multiple buttons and links throughout the site
- Link to related sub-pages like "${path}/about", "${path}/contact", "${path}/help", "${path}/services"
- Add creative cross-links to completely different concepts like "/unicorns", "/mystery", "/adventure", "/pizza"
- Make navigation feel like a real interconnected website with many pages to explore
- Include "Random Page" buttons that link to unexpected concepts

CONTENT DEPTH:
Professional sites: 8+ sections with comprehensive business information, pricing, testimonials, FAQ, team details
Creative sites: 4-6 highly engaging sections focused on entertainment and interactivity
All sites: Substantial content that feels authentic and lived-in

TECHNICAL EXCELLENCE:
- NO IMAGES (no img tags, background-image, or image references)
- Use Unicode symbols, CSS shapes, creative typography, and text-based visuals
- Responsive design with smooth animations where appropriate
- Interactive JavaScript elements that enhance the experience
- Clean semantic HTML structure

CREATIVITY MANDATE:
- Make every site memorable and unique unless it's meant to be boring
- Include unexpected elements, easter eggs, and personality
- Use period-appropriate styling (90s neon, early 2000s gradients, modern minimalism)
- Add interactive features like games, generators, counters, or widgets
- Make it feel like discovering a hidden gem of the internet

AUTHENTICITY:
- Include realistic details appropriate to the concept
- Use authentic terminology and demonstrate genuine expertise
- Make it feel like a real site that's been online for years
- Reference appropriate cultural elements and time periods

Transform "${path}" into the most convincing, creative website possible with immediate HTML generation.`;

// Function to generate website content using Claude
async function generateWebsiteContent(path) {
  const prompt = generatePrompt(path);

  try {
    console.log(`Generating creative website for: /${path}`);
    
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 3000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    }, {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      }
    });

    let content = response.data.content[0].text;
    
    // Post-process the content to remove unwanted preamble text and add SEO
    const processedContent = postProcessContent(content, path, new Date().toISOString());
    
    return processedContent;
  } catch (error) {
    console.error('Error generating content:', error.response?.data || error.message);
    throw new Error('Failed to generate website content');
  }
}

module.exports = { generatePrompt, generateWebsiteContent };
