const { supabase, extractTitle, extractDescription } = require('./supabase');

// In-memory cache for faster responses
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Function to get existing website from database or cache
async function getExistingWebsite(path) {
  // Check in-memory cache first
  const cacheKey = `website_${path}`;
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`💾 Cache hit for: /${path}`);
      return cached.data;
    }
    cache.delete(cacheKey);
  }

  // Check database if Supabase is configured
  if (supabase) {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('websites')
        .select('html, title, created_at, view_count, generator_x_handle')
        .eq('path', path)
        .single();
      
      if (existing && !fetchError) {
        // Increment view count
        await supabase
          .from('websites')
          .update({ 
            view_count: existing.view_count + 1,
            last_viewed: new Date().toISOString()
          })
          .eq('path', path);
        
        console.log(`📊 Serving existing website: /${path} (${existing.view_count + 1} views)`);
        
        // Cache the result
        cache.set(cacheKey, {
          data: {
            ...existing,
            view_count: existing.view_count + 1
          },
          timestamp: Date.now()
        });
        
        return {
          ...existing,
          view_count: existing.view_count + 1
        };
      }
    } catch (error) {
      console.error('Database fetch error:', error);
      // Continue to generate new content
    }
  }

  return null;
}

// Function to save generated website to database and cache
async function saveWebsite(path, html, generatorXHandle = null) {
  const generatedAt = new Date().toISOString();
  
  console.log(`💾 Saving website /${path} with generator: ${generatorXHandle || 'null'}`);
  
  // Cache the result
  const cacheKey = `website_${path}`;
  const websiteData = {
    path,
    html,
    title: extractTitle(html),
    description: extractDescription(html),
    view_count: 1,
    created_at: generatedAt,
    last_viewed: generatedAt,
    generator_x_handle: generatorXHandle
  };
  
  console.log(`💾 WebsiteData generator_x_handle: ${websiteData.generator_x_handle}`);
  
  cache.set(cacheKey, {
    data: websiteData,
    timestamp: Date.now()
  });

  // Save to database if Supabase is available
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('websites')
        .upsert(websiteData)
        .select();
      
      if (error) {
        console.error('💥 Database upsert error:', error);
      } else {
        console.log(`💾 Saved new website to database: /${path}`, data);
      }
    } catch (error) {
      console.error('Database save error:', error);
      // Continue even if database storage fails
    }
  }

  return websiteData;
}

// Function to clear cache periodically
function startCacheCleanup() {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }
    if (cache.size > 0) {
      console.log(`🧹 Cache cleanup: ${cache.size} items remaining`);
    }
  }, CACHE_TTL);
}

// Function to get cache stats
function getCacheStats() {
  return {
    size: cache.size,
    items: Array.from(cache.keys())
  };
}

// Function to clear all cache
function clearCache() {
  const prevSize = cache.size;
  cache.clear();
  console.log(`🗑️ Cache cleared: ${prevSize} items removed`);
  return { cleared: prevSize };
}

// Function to clear specific cache entry
function clearCacheEntry(cacheKey) {
  if (cache.has(cacheKey)) {
    cache.delete(cacheKey);
    console.log(`🗑️ Cleared cache entry: ${cacheKey}`);
    return { cleared: true };
  }
  console.log(`ℹ️ Cache entry not found: ${cacheKey}`);
  return { cleared: false };
}

module.exports = {
  getExistingWebsite,
  saveWebsite,
  startCacheCleanup,
  getCacheStats,
  clearCache,
  clearCacheEntry
};
