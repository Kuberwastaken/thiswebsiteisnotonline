const axios = require('axios');
const { postProcessContent } = require('./postProcessing');
const { getExistingWebsite, saveWebsite } = require('./database');

// Enhanced prompt generation with true randomness
function generatePrompt(path) {
  
return `CREATE A COMPLETE HTML WEBSITE FOR "${path}" - NO EXPLANATIONS, JUST CODE.

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

// Function to generate website content using Claude
async function generateWebsiteContent(path, generatorXHandle = null) {
  // Check if website already exists in database/cache
  const existing = await getExistingWebsite(path);
  if (existing) {
    return { 
      html: existing.html, 
      isExisting: true, 
      generatorXHandle: existing.generator_x_handle,
      view_count: existing.view_count,
      created_at: existing.created_at
    };
  }

  // Generate new content
  const prompt = generatePrompt(path);

  try {
    console.log(`🤖 Generating new website for: /${path}`);
    
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
    
    // Save to database and cache
    await saveWebsite(path, processedContent, generatorXHandle);
    
    return { 
      html: processedContent, 
      isExisting: false, 
      generatorXHandle 
    };
  } catch (error) {
    console.error('Error generating content:', error.response?.data || error.message);
    throw new Error('Failed to generate website content');
  }
}

module.exports = { generatePrompt, generateWebsiteContent };
