import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to extract title from HTML
export function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : 'Generated Website';
}

// Helper function to extract description from HTML
export function extractDescription(html) {
  // Try to extract from meta description first
  const metaDescMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
  if (metaDescMatch) return metaDescMatch[1].trim();
  
  // Fallback: extract first text content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    const textContent = bodyMatch[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return textContent.substring(0, 160) + (textContent.length > 160 ? '...' : '');
  }
  
  return 'A unique AI-generated website';
}
