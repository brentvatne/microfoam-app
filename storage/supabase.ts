import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jfpyztaybgpxjagszpjp.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcHl6dGF5YmdweGphZ3N6cGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjM5NjkzMjQsImV4cCI6MTk3OTU0NTMyNH0.uNWLKcDZ7vtX0ezmO-DPXNCJWZL8W263wQT1hk36Mpw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
