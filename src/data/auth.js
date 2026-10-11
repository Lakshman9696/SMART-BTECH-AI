import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(supabaseConfigured);
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setLoading(false); } });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  return { user: session?.user ?? null, session, loading, configured: supabaseConfigured };
}
