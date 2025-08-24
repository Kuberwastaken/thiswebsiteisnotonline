// Test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔗 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? 'Present ✓' : 'Missing ✗');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.log('Make sure you have created .env.local with:');
  console.log('SUPABASE_URL=https://sfwsymekrtcrkwqjdznv.supabase.co');
  console.log('SUPABASE_SERVICE_KEY=your-service-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('\n🧪 Testing database connection...');
    
    // Test 1: Check if table exists
    const { data: tables, error: tableError } = await supabase
      .from('websites')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ Table error:', tableError.message);
      console.log('📝 Make sure you created the "websites" table in Supabase SQL Editor');
      return;
    }
    
    console.log('✅ Table exists! Current website count:', tables || 0);
    
    // Test 2: Try to insert a test record
    console.log('\n🧪 Testing insert operation...');
    const testData = {
      path: 'test-' + Date.now(),
      html: '<html><head><title>Test</title></head><body>Test Page</body></html>',
      title: 'Test Page',
      description: 'A test page to verify Supabase integration',
      view_count: 1
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('websites')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError.message);
      return;
    }
    
    console.log('✅ Insert successful!', insertData[0]);
    
    // Test 3: Try to read the record
    console.log('\n🧪 Testing select operation...');
    const { data: selectData, error: selectError } = await supabase
      .from('websites')
      .select('*')
      .eq('path', testData.path)
      .single();
    
    if (selectError) {
      console.error('❌ Select error:', selectError.message);
      return;
    }
    
    console.log('✅ Select successful!', selectData);
    
    // Clean up: Delete test record
    console.log('\n🧹 Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('websites')
      .delete()
      .eq('path', testData.path);
    
    if (!deleteError) {
      console.log('✅ Cleanup successful!');
    }
    
    console.log('\n🎉 All tests passed! Supabase is ready to use.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection();
