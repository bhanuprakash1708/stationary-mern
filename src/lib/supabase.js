import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we're in development with placeholder values
const isPlaceholder = (value) => {
  return !value ||
         value === 'your_supabase_project_url_here' ||
         value === 'your_supabase_anon_key_here' ||
         value.includes('your-project') ||
         value.includes('your_');
};

// Validate environment variables
if (!supabaseUrl || isPlaceholder(supabaseUrl)) {
  console.warn('⚠️  VITE_SUPABASE_URL is not configured. Please set your Supabase URL in .env.local');
}

if (!supabaseKey || isPlaceholder(supabaseKey)) {
  console.warn('⚠️  VITE_SUPABASE_ANON_KEY is not configured. Please set your Supabase anon key in .env.local');
}

// Create a mock client for development if credentials are missing
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ error: new Error('Supabase not configured') }),
    delete: () => ({ error: new Error('Supabase not configured') }),
    upsert: () => ({ error: new Error('Supabase not configured') }),
    eq: function() { return this; },
    order: function() { return this; }
  })
});

// Export either real client or mock client
export const supabase = (!supabaseUrl || !supabaseKey || isPlaceholder(supabaseUrl) || isPlaceholder(supabaseKey))
  ? createMockClient()
  : createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = !(!supabaseUrl || !supabaseKey || isPlaceholder(supabaseUrl) || isPlaceholder(supabaseKey));
