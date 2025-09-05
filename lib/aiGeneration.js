const axios = require('axios');
const { postProcessContent } = require('./postProcessing');
const { getExistingWebsite, saveWebsite } = require('./database');

// Validate and sanitize advanced options
function validateAdvancedOptions(options) {
  const validated = {};
  const allowedOptions = ['style', 'content', 'topic'];
  
  for (const [key, value] of Object.entries(options)) {
    if (!allowedOptions.includes(key)) continue;
    if (!value || typeof value !== 'string') continue;
    
    // Sanitize: remove harmful characters, trim, limit length
    const sanitized = value
      .replace(/[<>{}]/g, '') // Remove potential HTML/template injection
      .replace(/\n\r/g, ' ') // Convert newlines to spaces
      .trim()
      .slice(0, 200);
    
    if (sanitized.length > 0) {
      validated[key] = sanitized;
    }
  }
  
  return validated;
}

// Build advanced customization section for prompt
function buildAdvancedSection(validatedOptions) {
  const options = Object.entries(validatedOptions);
  if (options.length === 0) return '';
  
  const optionLabels = {
    style: 'STYLE DIRECTION',
    content: 'CONTENT TYPE', 
    topic: 'TOPIC/FOCUS'
  };
  
  const optionsList = options
    .map(([key, value]) => `- ${optionLabels[key]}: ${value}`)
    .join('\n');
  
  return `
ADVANCED CUSTOMIZATION:
${optionsList}

Follow these specific requirements above when creating the website. They take priority over general concept interpretation.
`;
}

// Enhanced prompt generation with better advanced options handling
function generatePrompt(path, advancedOptions = {}) {
  const validatedOptions = validateAdvancedOptions(advancedOptions);
  const advancedSection = buildAdvancedSection(validatedOptions);
  
  // Log what options are being used for debugging
  if (Object.keys(validatedOptions).length > 0) {
    console.log(`🎯 Using advanced options for /${path}:`, validatedOptions);
  }
  
return `CREATE A COMPLETE HTML WEBSITE FOR "${path}" - NO EXPLANATIONS, JUST CODE.
${advancedSection}
🎨 VISUAL PRIORITY: This website MUST be visually striking and memorable. Avoid all bland, generic, or monochromatic designs. Use rich colors, creative layouts, and strong visual personality.

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
- Rich, sophisticated color schemes (deep blues with gold, elegant navy with silver, forest green with cream, sophisticated burgundy with gray) - NEVER plain white
- Use professional gradients and subtle textures for visual interest
- Comprehensive content: services, pricing, testimonials, FAQ, contact info
- 6-8 sections with detailed business information
- Make it feel established and trustworthy while still visually engaging

FOR FUN/CREATIVE/MEME CONCEPTS (hobbies, entertainment, quirky ideas):
- Bold, creative designs with maximum personality and visual impact
- Vibrant color combinations: neon palettes, rainbow gradients, electric colors, retro schemes
- Creative layouts with unique visual elements, geometric shapes, and dynamic sections
- Interactive elements, games, or unique features that match the theme
- 3-5 highly engaging sections focused on entertainment and visual appeal
- Embrace the weird, wonderful, and visually striking - make it impossible to ignore!

FOR NICHE/SPECIALTY CONCEPTS:
- Theme heavily around the specific topic
- Use appropriate visual language for that niche
- Include authentic terminology and passionate details
- Make it feel like it was created by a true enthusiast

🚫 NO GENERIC WEBSITES:
- NEVER EVER use boring white backgrounds with plain black text
- NEVER use light gray, beige, or pale color schemes
- Every site MUST have strong visual personality matching its concept
- Fun sites: Use bold themes (neon, retro, cyberpunk, rainbow, space, gaming aesthetics)
- Professional sites: Rich color schemes (deep blues with gold accents, elegant greens, sophisticated purples) that stand out
- Match colors, fonts, and layout to the concept's natural personality

🌈 MANDATORY COLOR REQUIREMENTS:
- Use AT LEAST 3-4 distinct colors in your design
- Include vibrant accent colors and rich background tones
- Creative use of gradients, color overlays, and themed palettes
- Background should never be plain white - use colors, gradients, or patterns
- Text should have good contrast but avoid basic black-on-white
- Examples: Deep space themes (dark purples/blues with neon accents), nature themes (rich greens with earth tones), tech themes (dark backgrounds with cyan/orange highlights)

🎨 VISUAL PERSONALITY REQUIREMENTS:
- Each website must feel visually unique and memorable
- Use creative typography, interesting layouts, and engaging visual elements
- Professional doesn't mean boring - use sophisticated color combinations
- Fun concepts should be visually exciting with bold choices
- Every element should contribute to the overall theme and mood

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

// Resolve model configuration (env-driven)
function resolveModelConfig() {
  const provider = (process.env.MODEL_PROVIDER || 'openrouter').toLowerCase();
  if (provider === 'local') {
    return {
      provider: 'local',
      baseURL: process.env.MODEL_API_BASE || 'http://localhost:8000/v1',
      model: process.env.MODEL_NAME || 'openai/gpt-oss-20b',
      apiKey: process.env.MODEL_API_KEY || '',
      headers: () => {
        const h = { 'Content-Type': 'application/json' };
        if (process.env.MODEL_API_KEY) h['Authorization'] = `Bearer ${process.env.MODEL_API_KEY}`;
        return h;
      }
    };
  }
  // default OpenRouter
  return {
    provider: 'openrouter',
    baseURL: 'https://openrouter.ai/api/v1',
    model: process.env.MODEL_NAME || 'openai/gpt-oss-120b',
    apiKey: process.env.OPENROUTER_API_KEY,
    headers: () => ({
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.SITE_URL || 'https://localhost:3000',
      'X-Title': process.env.SITE_NAME || 'This Website Is Not Online',
      'Content-Type': 'application/json'
    })
  };
}

// Function to generate website content using configured model (OpenRouter or local)
async function generateWebsiteContent(path, generatorXHandle = null, advancedOptions = {}) {
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
  const prompt = generatePrompt(path, advancedOptions);
  const modelCfg = resolveModelConfig();

  try {
    console.log(`🤖 Generating new website for: /${path} using model ${modelCfg.model} (${modelCfg.provider})`);

    const url = `${modelCfg.baseURL}/chat/completions`;
    const response = await axios.post(url, {
      model: modelCfg.model,
      max_tokens: 5000,
      temperature: 0.7,
      messages: [
        { role: 'user', content: prompt }
      ]
    }, { headers: modelCfg.headers() });

    let content = response.data.choices[0].message.content;
    
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
    const modelCfg = resolveModelConfig();
    
    // Check if it's a rate limit error and provide helpful message
    if (error.response?.data?.error?.code === 429) {
      const errorMessage = error.response.data.error.metadata?.raw || error.response.data.error.message;
      console.log('🚨 Rate limit hit:', errorMessage);
      
      // If it's the free model that's rate limited, suggest alternatives
      if (errorMessage.includes('gpt-oss-120b:free')) {
        console.log('💡 Suggestion: Consider switching to a different model or adding your own OpenRouter API key');
      }
      
      throw new Error(`Rate limit exceeded: ${errorMessage}`);
    }
    if (modelCfg.provider === 'local') {
      throw new Error('Failed to generate website content (local provider)');
    }
    throw new Error('Failed to generate website content (openrouter)');
  }
}

module.exports = { generatePrompt, generateWebsiteContent };
