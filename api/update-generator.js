// Vercel API route for updating generator information

const { supabase } = require('../lib/supabase');

export default async function handler(req, res) {
  console.log('🔔 Update generator API called:', { method: req.method, body: req.body });
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { path, xHandle } = req.body;
  console.log('📝 Received data:', { path, xHandle });

  if (!path) {
    console.log('❌ No path provided');
    return res.status(400).json({ error: 'Path is required' });
  }

  // Validate X handle
  let cleanHandle = null;
  if (xHandle) {
    const sanitized = xHandle.replace(/^@/, '').toLowerCase().trim();
    console.log('🧹 Sanitized handle:', sanitized);
    if (/^[a-z0-9_]{1,15}$/i.test(sanitized)) {
      cleanHandle = sanitized;
      console.log('✅ Valid handle:', cleanHandle);
    } else {
      console.log('❌ Invalid handle format:', sanitized);
      return res.status(400).json({ error: 'Invalid X handle' });
    }
  } else {
    console.log('ℹ️ No xHandle provided, will set to null');
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    console.log(`🔄 Updating generator for /${path} to: ${cleanHandle || 'null'}`);
    
    // Update the generator info in the database
    const { data, error } = await supabase
      .from('websites')
      .update({ generator_x_handle: cleanHandle })
      .eq('path', path)
      .select();

    if (error) {
      console.error('💥 Database update error:', error);
      return res.status(500).json({ error: 'Failed to update generator info' });
    }

    console.log(`✅ Updated generator for /${path}: @${cleanHandle || 'Anonymous'}`, data);
    
    // Clear cache for this path since generator info changed
    const { clearCacheEntry } = require('../lib/database');
    const cacheKey = `website_${path}`;
    clearCacheEntry(cacheKey);
    
    res.json({ 
      success: true, 
      generator: cleanHandle || 'Anonymous',
      message: `Generator updated to @${cleanHandle || 'Anonymous'}`,
      updatedRows: data?.length || 0
    });
  } catch (error) {
    console.error('Update generator error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
