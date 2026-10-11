import { useCallback, useEffect, useState } from 'react';
import { profileRepository } from '../services/profileRepository';
import { supabaseConfigured } from '../lib/supabase';

export function useProfile(userId) {
 const [profile, setProfile] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 useEffect(() => {
   let active = true;
   setLoading(true); setError('');
   profileRepository.load(userId).then(value => { if (active) setProfile(value); })
     .catch(() => { if (active) setError('We could not load your saved profile. Please try again.'); })
     .finally(() => { if (active) setLoading(false); });
   return () => { active = false; };
 }, [userId]);
 const saveProfile = useCallback(async next => {
   setError('');
   try { const saved = await profileRepository.save(next, userId); setProfile(saved); return saved; }
   catch (issue) { setError(issue.message || 'Your profile could not be saved.'); throw issue; }
 }, [userId]);
 return { profile, saveProfile, loading, error, secureStorage: supabaseConfigured };
}
