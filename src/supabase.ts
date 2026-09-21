import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wvlaetlzpkemdpjrztun.supabase.co';
const supabaseKey = 'sb_publishable_lHsT483fRZJro5X7GDQ4Eg_ojDhZaeE'; // (a sua Publishable key completa)

export const supabase = createClient(supabaseUrl, supabaseKey);