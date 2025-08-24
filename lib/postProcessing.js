import { extractTitle, extractDescription } from './supabase.js';

// Post-processing function to clean AI-generated content and add SEO
export function postProcessContent(content, path, generatedAt) {
  // Remove the unwanted preamble text that sometimes appears
  const unwantedPatterns = [
    /^Here is the complete HTML code for a website based on the URL path "[^"]*":\s*/i,
    /^Here is the HTML code for a complete, unique website based on the URL path "[^"]*":\s*/i,
    /^Here is the complete HTML code for the website based on the URL path "[^"]*":\s*/i,
    /^Here is the complete HTML code for the website:\s*/i,
    /^Here is a complete HTML page for "[^"]*":\s*/i,
    /^Here's the complete HTML code for "[^"]*":\s*/i,
    /^Here's a complete HTML page for "[^"]*":\s*/i,
    /^Here's the HTML code for "[^"]*":\s*/i,
    /^Here is the HTML code for "[^"]*":\s*/i,
    /^Here's a creative interpretation of "[^"]*":\s*/i,
    /```html\s*/i,
    /```\s*/i
  ];
  
  let cleanedContent = content;
  
  // Remove unwanted preamble text
  for (const pattern of unwantedPatterns) {
    if (pattern.test(cleanedContent)) {
      console.log('Found and removing unwanted preamble text');
      cleanedContent = cleanedContent.replace(pattern, '');
      break;
    }
  }
  
  // Replace all instances of 2023 with 2025
  const yearMatches = cleanedContent.match(/2023/g);
  if (yearMatches) {
    console.log(`Replacing ${yearMatches.length} instances of 2023 with 2025`);
    cleanedContent = cleanedContent.replace(/2023/g, '2025');
  }
  
  // Trim any extra whitespace
  cleanedContent = cleanedContent.trim();
  
  // Add comprehensive SEO meta tags
  cleanedContent = addSEOMetaTags(cleanedContent, path, generatedAt);
  
  return cleanedContent;
}

function addSEOMetaTags(html, path, generatedAt) {
  const title = extractTitle(html);
  const description = extractDescription(html);
  const url = `https://thiswebsiteisnot.online/${path}`;
  const formattedDate = new Date(generatedAt).toISOString();
  
  // Create comprehensive meta tags
  const metaTags = `
    <!-- Primary Meta Tags -->
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">
    <meta name="keywords" content="${path}, creative web design, unique website, business, service">
    <meta name="author" content="Kuber Mehta">
    <meta name="robots" content="index, follow">
    <meta name="language" content="English">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:site_name" content="ThisWebsiteIsNot.Online">
    <meta property="og:locale" content="en_US">
    <meta property="article:published_time" content="${formattedDate}">
    <meta property="article:author" content="Kuber Mehta">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:creator" content="@kuberwastaken">
    <meta property="twitter:site" content="@kuberwastaken">
    
    <!-- Additional SEO -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#000000">
    <link rel="canonical" href="${url}">
    
    <!-- Schema.org structured data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "${title}",
      "description": "${description}",
      "url": "${url}",
      "dateCreated": "${formattedDate}",
      "datePublished": "${formattedDate}",
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "name": "ThisWebsiteIsNot.Online",
        "url": "https://thiswebsiteisnot.online"
      },
      "creator": {
        "@type": "Person",
        "name": "Kuber Mehta",
        "url": "https://kuber.studio",
        "sameAs": [
          "https://x.com/kuberwastaken",
          "https://kuber.studio"
        ]
      },
      "publisher": {
        "@type": "Person",
        "name": "Kuber Mehta",
        "url": "https://kuber.studio"
      }
    }
    </script>`;
  
  // Insert meta tags after <head> tag
  const headMatch = html.match(/(<head[^>]*>)/i);
  if (headMatch) {
    html = html.replace(headMatch[1], headMatch[1] + metaTags);
  }
  
  // Add footer with creator info if not present
  html = addCreatorFooter(html, generatedAt);
  
  return html;
}

function addCreatorFooter(html, generatedAt, viewCount) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const footerHTML = `
    <!-- Creator Attribution -->
    <div style="
      position: fixed; 
      bottom: 10px; 
      right: 10px; 
      background: rgba(0,0,0,0.85); 
      color: white; 
      padding: 10px 14px; 
      border-radius: 8px; 
      font-size: 11px; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 9999;
      text-decoration: none;
      box-shadow: 0 3px 15px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      line-height: 1.3;
      min-width: 160px;
    " 
    onmouseover="this.style.background='rgba(0,0,0,0.95)'; this.style.transform='translateY(-2px)'"
    onmouseout="this.style.background='rgba(0,0,0,0.85)'; this.style.transform='translateY(0)'"
    onclick="window.open('https://kuber.studio', '_blank')">
             <div style="margin-bottom: 4px; font-weight: 600;">📅 Generated: ${formatDate(generatedAt)}</div>
       <div style="opacity: 0.8; font-size: 10px;">Visited: ${viewCount || 1} time${(viewCount || 1) !== 1 ? 's' : ''}</div>
    </div>`;
  
  // Insert before closing body tag
  if (html.includes('</body>')) {
    html = html.replace('</body>', footerHTML + '\n</body>');
  } else {
    html += footerHTML;
  }
  
  return html;
}
