import { createClient } from '@supabase/supabase-js';

// Substitua estas strings pelos seus dados do Supabase
const supabaseUrl = 'https://wvlaetlzpkemdpjrztun.supabase.co/rest/v1/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bGFldGx6cGtlbWRwanJ6dHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDE5NjcsImV4cCI6MjEwNTMxNzk2N30.PQG0hm2NWW4lJiJdxUyB6JQCANTXmsbr9qaaupoxtps';

export const supabase = createClient(supabaseUrl, supabaseKey);