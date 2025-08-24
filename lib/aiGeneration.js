const axios = require('axios');

// Enhanced prompt generation with true randomness
function generatePrompt(path) {
  // Add random elements to prevent repetitive patterns
  const randomNum = Math.random();
  const styles = ['minimalist', 'retro', 'modern', 'playful', 'elegant', 'bold', 'quirky', 'classic', 'edgy', 'warm'];
  const vibes = ['professional', 'fun', 'mysterious', 'energetic', 'calm', 'vibrant', 'sophisticated', 'rustic', 'futuristic', 'vintage'];
  const concepts = ['business', 'hobby', 'service', 'community', 'marketplace', 'showcase', 'platform', 'hub', 'studio', 'workshop'];
  
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
  const randomConcept = concepts[Math.floor(Math.random() * concepts.length)];
  
  return `Create a complete HTML page for "${path}". Make it a ${randomStyle} ${randomConcept} with a ${randomVibe} vibe.

🎯 CREATIVE FREEDOM:
- Transform "${path}" into something unexpected and specific to the word itself
- Give it a creative but REALISTIC interpretation (avoid quantum/temporal/dimensional themes)
- Think about what a real business or service with this name might actually do
- Make it feel authentic and purposeful - like a real website that exists
- Be creative but grounded - no sci-fi unless the path suggests it

🎨 DESIGN VARIETY:
- Choose colors and style that match the concept naturally
- Vary your design approach: sometimes simple, sometimes complex
- Use different color schemes: pastels, earth tones, bright colors, dark themes
- Mix up layouts: grid-based, centered, sidebar, full-width
- Vary typography: sans-serif, serif, display fonts, handwritten styles

⚡ CORE FUNCTIONALITY:
- ONE main interactive feature that works
- All buttons and links should point to another page
- Links can be either sub-pages of the same site (e.g., "ducks/watch" from "ducks") or completely new websites (e.g., "/boost" from "/ducks")
- Simple, focused user interface  
- Clear value proposition
- Real-looking content (not Lorem ipsum)

🚫 STRICT RULES:
- NO IMAGES AT ALL (not even CSS background-images or data URIs)
- NO references to images, photos, or visual media
- NO <img> tags, background-image, or image-related CSS
- Use only: text, colors, CSS shapes, borders, gradients, emojis, Unicode symbols
- The links (sublinks) in the generated website should be unique and point to other pages
- Maximum 1800 characters total
- Only return HTML - no explanations or comments

🎭 VISUAL ELEMENTS TO USE:
- CSS shapes with gradients (border-radius, clip-path, transform)
- Colorful gradient backgrounds (linear-gradient, radial-gradient, conic-gradient)
- Animated Unicode symbols (★ ◆ ▲ ● ☆ ◉ ◯) with CSS animations
- Emojis with hover effects and animations
- Creative typography with text animations and gradient text
- Animated box shadows and colorful borders
- CSS animations: @keyframes, transitions, transforms
- Glowing effects with box-shadow and filter: drop-shadow
- Pulsing animations, bouncing effects, and smooth hover transitions

Make it authentic and purposeful - like someone actually built this for "${path}". Make it look like a real website that's been around for ages. AVOID overused themes like quantum, temporal, dimensional, interdimensional, matrix, or cyber themes unless directly relevant to the path name!`;
}

// Function to generate website content using Claude
async function generateWebsiteContent(path) {
  const prompt = generatePrompt(path);

  try {
    console.log(`Generating creative website for: /${path}`);
    
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2500,
      temperature: 0.8,
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
