const { extractTitle, extractDescription } = require('./supabase.js');

// Post-processing function to clean AI-generated content and add SEO
function postProcessContent(content, path, generatedAt, generatorXHandle = null, isNewGeneration = false, viewCount = 1) {
  // Remove the unwanted preamble text that sometimes appears
  const unwantedPatterns = [
    // Most aggressive patterns first - catch anything before <!DOCTYPE html>
    /^.*?(?=<!DOCTYPE html>)/is,
    
    // Specific patterns for common AI responses
    /^Here'?s? (the |a )?comprehensive HTML (website )?for "[^"]*":\s*```?html\s*/i,
    /^Here'?s? (the |a )?complete HTML (code |website |page )?for "[^"]*":\s*```?html\s*/i,
    /^Here'?s? (the |a )?HTML (code |website |page )?for "[^"]*":\s*```?html\s*/i,
    /^Here'?s? (the |a )?website (code |HTML )?for "[^"]*":\s*```?html\s*/i,
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
    /^Here's the comprehensive HTML website for "[^"]*":\s*/i,
    /^Here's the comprehensive HTML for "[^"]*":\s*/i,
    /^Here's the comprehensive HTML for [^:]*:\s*```?html\s*/i,
    /^Here's the comprehensive HTML for [^:]*:\s*/i,
    
    // Generic patterns
    /^.*?```?html\s*/i,
    /^```?html\s*/i,
    /^```\s*/i,
    
    // Any explanatory text at the beginning
    /^[^<]*?(?=<!DOCTYPE)/is
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
  
  // Remove any trailing markdown code block endings
  cleanedContent = cleanedContent.replace(/```\s*$/i, '');
  
  // Remove any explanatory text before the HTML starts
  const htmlStartMatch = cleanedContent.match(/<!DOCTYPE html>/i);
  if (htmlStartMatch) {
    const htmlStartIndex = cleanedContent.indexOf(htmlStartMatch[0]);
    if (htmlStartIndex > 0) {
      console.log('Trimming content before HTML start');
      cleanedContent = cleanedContent.substring(htmlStartIndex);
    }
  }
  
  // Replace all instances of 2023 and 2024 with 2025
  const year2023Matches = cleanedContent.match(/2023/g);
  const year2024Matches = cleanedContent.match(/2024/g);
  
  if (year2023Matches) {
    console.log(`Replacing ${year2023Matches.length} instances of 2023 with 2025`);
    cleanedContent = cleanedContent.replace(/2023/g, '2025');
  }
  
  if (year2024Matches) {
    console.log(`Replacing ${year2024Matches.length} instances of 2024 with 2025`);
    cleanedContent = cleanedContent.replace(/2024/g, '2025');
  }
  
  // Trim any extra whitespace
  cleanedContent = cleanedContent.trim();
  
  // Add comprehensive SEO meta tags
  cleanedContent = addSEOMetaTags(cleanedContent, path, generatedAt, generatorXHandle, isNewGeneration, viewCount);
  
  return cleanedContent;
}

function generateDynamicKeywords(html, path) {
  // Extract keywords from content and title
  const text = html.toLowerCase();
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an'];
  
  // Extract potential keywords from content
  const words = text.match(/\b[a-z]{3,15}\b/g) || [];
  const wordCount = {};
  
  words.forEach(word => {
    if (!commonWords.includes(word) && word.length > 2) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Get top keywords
  const topKeywords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([word]) => word);
  
  // Combine with path-based keywords
  const pathKeywords = [path, `${path} business`, `${path} service`, `${path} online`];
  const allKeywords = [...pathKeywords, ...topKeywords].slice(0, 12);
  
  return allKeywords.join(', ');
}

function addSEOMetaTags(html, path, generatedAt, generatorXHandle = null, isNewGeneration = false, viewCount = 1) {
  const title = extractTitle(html);
  const description = extractDescription(html);
  const url = `https://thiswebsiteisnot.online/${path}`;
  const formattedDate = new Date(generatedAt).toISOString();
  
  // Create comprehensive meta tags
  const metaTags = `
    <!-- Primary Meta Tags -->
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">
    <meta name="keywords" content="${generateDynamicKeywords(html, path)}">
    <meta name="author" content="${generatorXHandle ? `@${generatorXHandle}, Kuber Mehta` : 'Kuber Mehta'}">
    <meta name="generator" content="ThisWebsiteIsNot.Online${generatorXHandle ? ` by @${generatorXHandle}` : ''}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="language" content="English">
    <meta name="distribution" content="global">
    <meta name="rating" content="general">
    <meta name="revisit-after" content="7 days">
    <meta http-equiv="Content-Language" content="en-us">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="https://thiswebsiteisnot.online/assets/embed_image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${title} - Generated by ThisWebsiteIsNot.Online">
    <meta property="og:site_name" content="ThisWebsiteIsNot.Online">
    <meta property="og:locale" content="en_US">
    <meta property="article:published_time" content="${formattedDate}">
    <meta property="article:author" content="Kuber Mehta">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="https://thiswebsiteisnot.online/assets/embed_image.png">
    <meta property="twitter:image:alt" content="${title} - Generated by ThisWebsiteIsNot.Online">
    <meta property="twitter:creator" content="@kuberwastaken">
    <meta property="twitter:site" content="@kuberwastaken">
    
    <!-- Favicons and App Icons -->
    <link rel="icon" href="/assets/favicon.ico" sizes="any">
    <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
    <link rel="icon" href="/assets/favicon-96x96.png" sizes="96x96" type="image/png">
    <link rel="manifest" href="/assets/site.webmanifest">
    
    <!-- Additional SEO -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#000000">
    <link rel="canonical" href="${url}">
    
    <!-- Umami Analytics -->
    <script defer src="https://cloud.umami.is/script.js" data-website-id="10096734-4b52-416d-9462-bba1d0c82206"></script>
    
    <!-- Custom Analytics Events -->
    <script>
      // Track website generation event
      window.addEventListener('load', function() {
        if (typeof umami !== 'undefined') {
          umami.track('website-generated', {
            path: '${path}',
            timestamp: new Date().toISOString()
          });
        }
      });
      
      // Track clicks on generated links
      document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && typeof umami !== 'undefined') {
          const href = e.target.getAttribute('href');
          if (href && href.startsWith('/')) {
            umami.track('internal-link-click', {
              from: '${path}',
              to: href,
              linkText: e.target.innerText.slice(0, 50)
            });
          }
        }
      });
      
      // Track footer clicks (attribution)
      document.addEventListener('click', function(e) {
        if (e.target.closest('[onclick*="kuber.studio"]') && typeof umami !== 'undefined') {
          umami.track('footer-attribution-click', {
            from: '${path}'
          });
        }
      });
    </script>
    
    <!-- Schema.org structured data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": ["WebPage", "CreativeWork"],
      "name": "${title}",
      "description": "${description}",
      "url": "${url}",
      "identifier": "${url}",
      "dateCreated": "${formattedDate}",
      "datePublished": "${formattedDate}",
      "dateModified": "${formattedDate}",
      "inLanguage": "en-US",
      "keywords": "${generateDynamicKeywords(html, path)}",
      "genre": "Business Website",
      "audience": {
        "@type": "Audience",
        "audienceType": "General Public"
      },
      "isPartOf": {
        "@type": "WebSite",
        "name": "ThisWebsiteIsNot.Online",
        "url": "https://thiswebsiteisnot.online",
        "description": "Creative website generator creating unique business websites",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://thiswebsiteisnot.online/{search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      "mainEntity": {
        "@type": "Organization",
        "name": "${title.replace(/[|•]/g, '-').split('-')[0].trim()}",
        "description": "${description}",
        "url": "${url}"
      },
      "creator": [
        {
          "@type": "Person",
          "name": "Kuber Mehta",
          "url": "https://kuber.studio",
          "jobTitle": "Platform Creator",
          "sameAs": [
            "https://x.com/kuberwastaken",
            "https://kuber.studio",
            "https://github.com/kuberwastaken"
          ]
        }${generatorXHandle ? `,
        {
          "@type": "Person",
          "name": "@${generatorXHandle}",
          "jobTitle": "Website Generator",
          "url": "https://x.com/${generatorXHandle}",
          "sameAs": [
            "https://x.com/${generatorXHandle}"
          ]
        }` : ''}
      ],
      "publisher": {
        "@type": "Person",
        "name": "Kuber Mehta",
        "url": "https://kuber.studio"
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://thiswebsiteisnot.online"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "${title}",
            "item": "${url}"
          }
        ]
      }
    }
    </script>`;
  
  // Insert meta tags after <head> tag
  const headMatch = html.match(/(<head[^>]*>)/i);
  if (headMatch) {
    html = html.replace(headMatch[1], headMatch[1] + metaTags);
  }
  
  // Add footer with creator info if not present
  html = addCreatorFooter(html, generatedAt, viewCount, generatorXHandle, isNewGeneration);
  
  return html;
}

function addCreatorFooter(html, generatedAt, viewCount, generatorXHandle = null, isNewGeneration = false) {
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
    <div id="creatorFooter" style="
      position: fixed; 
      bottom: 10px; 
      right: 10px; 
      background: rgba(255,255,255,0.95); 
      color: #000000; 
      padding: 12px 16px; 
      border-radius: 8px; 
      font-size: 11px; 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 9999;
      text-decoration: none;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
      line-height: 1.4;
      min-width: 160px;
      cursor: pointer;
      border: 1px solid rgba(0,0,0,0.1);
    " 
    onmouseover="this.style.boxShadow='0 6px 25px rgba(0,0,0,0.2)'; this.style.transform='translateY(-2px)'"
    onmouseout="this.style.boxShadow='0 4px 20px rgba(0,0,0,0.15)'; this.style.transform='translateY(0)'"
    onclick="handleFooterClick()">
      <div style="margin-bottom: 4px; font-weight: 600; color: #000000;">Generated: ${formatDate(generatedAt)}</div>
      
      ${isNewGeneration && !generatorXHandle ? `
        <div id="generatorPrompt" style="margin-bottom: 4px; font-size: 10px;">
          <div style="margin-bottom: 4px; color: #000000; font-weight: 600;">This is a new generation!</div>
          <input type="text" id="xHandleInput" placeholder="Your X handle" 
                 style="width: 100%; padding: 6px 8px; font-size: 10px; background: #ffffff; 
                        color: #000000; border: 1px solid rgba(0,0,0,0.2); border-radius: 4px; margin-bottom: 6px;
                        font-family: 'Inter', sans-serif;"
                 onkeypress="if(event.key==='Enter') saveXHandle()" 
                 onclick="event.stopPropagation()" maxlength="15" />
          <div style="font-size: 9px; color: #666666; margin-bottom: 6px;">Enter your X handle or leave empty for anonymous</div>
          <button onclick="saveXHandle(); event.stopPropagation()" 
                  style="padding: 4px 12px; font-size: 9px; background: #000000; color: #ffffff; 
                         border: none; border-radius: 4px; cursor: pointer; margin-right: 6px;
                         font-family: 'Inter', sans-serif; font-weight: 500;">Save</button>
          <button onclick="skipXHandle(); event.stopPropagation()" 
                  style="padding: 4px 12px; font-size: 9px; background: #ffffff; color: #000000;
                         border: 1px solid rgba(0,0,0,0.2); border-radius: 4px; cursor: pointer;
                         font-family: 'Inter', sans-serif; font-weight: 500;">Skip</button>
        </div>
      ` : `
        <div style="margin-bottom: 4px; font-size: 10px; color: #000000;">
          Generated by: <span id="generatorLink" style="color: #000000; cursor: pointer; font-weight: 500;" 
                              onclick="event.stopPropagation(); window.open('https://x.com/${generatorXHandle || 'kuberwastaken'}', '_blank')">
            @${generatorXHandle || 'Anonymous'}
          </span>
        </div>
      `}
      
      <div style="opacity: 0.8; font-size: 10px; margin-bottom: 4px; color: #000000;">Visited: ${viewCount || 1} time${(viewCount || 1) !== 1 ? 's' : ''}</div>
      <div style="opacity: 0.6; font-size: 9px; text-align: center; color: #666666;">
        Powered by <span style="color: #000000; font-weight: 500;">kuber.studio</span>
      </div>
    </div>
    
    <style>
      @media (max-width: 768px) {
        #creatorFooter {
          bottom: 10px !important;
          right: 10px !important;
          left: auto !important;
          transform: none !important;
          max-width: calc(100vw - 20px);
          min-width: 140px !important;
        }
      }
    </style>
    
    <script>
      function handleFooterClick() {
        ${generatorXHandle ? `window.open('https://x.com/${generatorXHandle}', '_blank')` : `window.open('https://x.com/kuberwastaken', '_blank')`};
      }
      
      function saveXHandle() {
        const input = document.getElementById('xHandleInput');
        const handle = input.value.trim().replace(/^@/, '');
        
        if (handle && !/^[a-zA-Z0-9_]{1,15}$/.test(handle)) {
          alert('Please enter a valid X handle (1-15 characters, letters, numbers, and underscores only)');
          return;
        }
        
        // Make API call to update the generator info
        const currentPath = window.location.pathname.slice(1);
        console.log('🚀 Calling update API with:', { path: currentPath, xHandle: handle });
        
        fetch('/api/update-generator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: currentPath, xHandle: handle })
        }).then(response => {
          console.log('📡 API Response status:', response.status);
          return response.json();
        }).then(data => {
          console.log('📝 API Response data:', data);
          if (data.success) {
            // Update the footer display
            document.getElementById('generatorPrompt').innerHTML = 
              '<div style="font-size: 10px; color: #000000;">Generated by: <span style="color: #000000; cursor: pointer; font-weight: 500;" onclick="event.stopPropagation(); window.open(\\'https://x.com/' + (handle || 'kuberwastaken') + '\\', \\'_blank\\')">@' + (handle || 'Anonymous') + '</span></div>';
            
            // Update click handler
            document.getElementById('creatorFooter').onclick = function() {
              window.open('https://x.com/' + (handle || 'kuberwastaken'), '_blank');
            };
          } else {
            console.error('❌ API call failed:', data);
            alert('Failed to save generator info: ' + (data.error || 'Unknown error'));
          }
        }).catch(error => {
          console.error('💥 Fetch error:', error);
          alert('Network error while saving generator info');
        });
      }
      
      function skipXHandle() {
        // Update to anonymous
        document.getElementById('generatorPrompt').innerHTML = 
          '<div style="font-size: 10px; color: #000000;">Generated by: <span style="color: #000000; cursor: pointer; font-weight: 500;" onclick="event.stopPropagation(); window.open(\\'https://x.com/kuberwastaken\\', \\'_blank\\')">@Anonymous</span></div>';
        
        // Update click handler to go to kuberwastaken
        document.getElementById('creatorFooter').onclick = function() {
          window.open('https://x.com/kuberwastaken', '_blank');
        };
      }
    </script>`;
  
  // Insert before closing body tag
  if (html.includes('</body>')) {
    html = html.replace('</body>', footerHTML + '\n</body>');
  } else {
    html += footerHTML;
  }
  
  return html;
}

module.exports = { postProcessContent };
