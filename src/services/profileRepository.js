import { supabase, supabaseConfigured } from '../lib/supabase';

const KEY = 'orbit-student-profile-v2';

/** Profile adapter: Supabase Auth + owner-scoped row when configured; browser demo otherwise. */
export const profileRepository = {
  async load(userId) {
    if (supabaseConfigured) {
      if (!userId) return null;
      const { data, error } = await supabase.from('student_profiles').select('profile').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return data?.profile ?? null;
    }
    try { return JSON.parse(localStorage.getItem(KEY)) || null; }
    catch { return null; }
  },
  async save(profile, userId) {
    const next = { ...profile, updatedAt: new Date().toISOString() };
    if (supabaseConfigured) {
      if (!userId) throw new Error('Sign in to save your profile securely.');
      const { error } = await supabase.from('student_profiles').upsert({ user_id: userId, profile: next, updated_at: next.updatedAt }, { onConflict: 'user_id' });
      if (error) throw error;
      return next;
    }
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  },
};
