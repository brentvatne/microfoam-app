import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, Session } from "@supabase/supabase-js";

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

// Side effect! Get the session right away so it's cached when we need it later.
supabase.auth.getSession();

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return session;
}
