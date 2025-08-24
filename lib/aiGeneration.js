const axios = require('axios');

// Enhanced prompt generation with true randomness
function generatePrompt(path) {
  
return `CREATE WEBSITE FOR: "${path}"

OUTPUT: Return ONLY complete HTML starting with <!DOCTYPE html>. NO explanations, analysis, or questions. NO "Here is the website" or similar text. JUST RAW HTML.

CONTEXT UNDERSTANDING - Determine silently:
- ERA: What internet era does "${path}" belong to? (90s personal site, early 2000s flash site, modern startup, corporate 2010s, etc.)
- AUDIENCE: Who would visit "${path}"? (professionals, kids, gamers, hobbyists, academics, general public, etc.)
- TONE: What personality should it have? (corporate professional, playful/fun, retro nostalgic, edgy/alternative, academic/serious, quirky/weird, etc.)

CONCEPT MATCHING - Choose appropriate style based on context:

🎨 DESIGN & THEMING - MATCH THE CONCEPT PERFECTLY:

FOR PROFESSIONAL/CORPORATE CONCEPTS:
- Clean, minimal, corporate styling with professional color schemes (blues, grays, whites)
- Conservative typography and layout
- Structured sections with business-appropriate content
- No flashy animations or gimmicks - pure professionalism
- Think: law firms, consulting, medical, financial services, real estate

FOR FUN/QUIRKY/MEME CONCEPTS:
- Embrace bold colors, creative layouts, and personality-driven design
- Period-appropriate styling (90s neon, early 2000s gradients, modern minimalism)
- Creative navigation, easter eggs, and interactive elements
- Personality over polish - make it memorable and entertaining
- Think: meme generators, hobby sites, fan pages, creative projects

FOR NICHE/SPECIALTY CONCEPTS:
- Theme heavily around the specific topic/industry
- Use appropriate color schemes and visual language for that niche
- Include industry-specific terminology and authentic details
- Make it feel like it was made by someone truly passionate about the subject

📋 CONTENT REQUIREMENTS - ADAPTIVE TO TYPE:

PROFESSIONAL BUSINESSES (Law, Medical, Consulting, etc.):
- 8-12 comprehensive sections minimum
- Extensive service descriptions with 4-6 paragraphs each
- Detailed pricing tables with multiple service tiers
- Professional testimonials with full names, companies, detailed quotes
- Comprehensive FAQ (8+ questions) addressing real client concerns
- About section with company history, credentials, years established
- Team section with multiple professionals and their qualifications
- Process/methodology explaining step-by-step client journey
- Contact with full business details (address, phone, hours, certifications)
- Use industry-specific jargon and demonstrate deep expertise
- 6000+ characters of substantial professional content

FUN/CREATIVE CONCEPTS:
- 3-6 sections focused on maximum entertainment value
- Each section should be incredibly engaging and on-theme
- Include interactive elements, games, or unique features
- Embrace the weird - hit counters, guestbooks, unusual navigation
- Period-appropriate elements (web rings, "under construction" gifs, etc.)
- Focus on personality and memorability over information density
- Still substantial content but prioritize entertainment and uniqueness

HYBRID CONCEPTS:
- Balance professionalism with personality
- More approachable than corporate but still informative
- Creative elements that enhance rather than distract from content
- Professional information presented in an engaging way

🎯 AUTHENTICITY REQUIREMENTS:
- Make it feel like a REAL website that's been online for years
- Include realistic business data: specific addresses, phone numbers, established dates
- Use authentic industry terminology and demonstrate real expertise
- Create believable customer stories and testimonials
- Include specific numbers, timelines, and concrete examples
- Make every detail feel lived-in and authentic to the concept
- Reference appropriate time periods, technologies, or cultural elements

⚡ TECHNICAL EXCELLENCE:
- NO IMAGES whatsoever (no <img>, background-image, or image references)
- Use text, emojis, Unicode symbols, CSS shapes, and creative typography
- Responsive design that works on all devices
- Smooth animations and transitions where appropriate to the concept
- Clean, semantic HTML structure
- Professional-grade CSS styling
- Interactive elements that enhance the story

🚫 CRITICAL RULES:
- NEVER apply inappropriate theming (no cyberpunk for law firms!)
- Match the visual style EXACTLY to what the concept demands
- Corporate = clean and minimal; Fun = bold and creative
- Every design choice must serve the authenticity of the concept
- ONLY return HTML - no explanations, analysis, questions, or markdown
- NO "Here is the website" or "Shall I proceed" or similar text
- IMMEDIATELY start with <!DOCTYPE html>
- Focus on making it look and feel like a real website

GENERATE COMPLETE WEBSITE NOW:`;
}

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
    
    return content;
  } catch (error) {
    console.error('Error generating content:', error.response?.data || error.message);
    throw new Error('Failed to generate website content');
  }
}

module.exports = { generatePrompt, generateWebsiteContent };
