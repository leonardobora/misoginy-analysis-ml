// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bggyeqmfqvinaqkscjff.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZ3llcW1mcXZpbmFxa3NjamZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjE2NTMsImV4cCI6MjA2NTQ5NzY1M30.pcgdvPoHnjYrFp1xyNrM-s2rLjt9Bwr_MPyRPRKrjtI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);