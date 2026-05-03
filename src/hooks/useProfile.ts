import { useEffect, useState } from 'react';
import { getProfile, subscribeProfile, type PublicProfile } from '../services/auth/profileService';

export function useProfile(): PublicProfile | null {
  const [profile, setProfile] = useState<PublicProfile | null>(() => getProfile());

  useEffect(() => {
    setProfile(getProfile());
    return subscribeProfile((next) => setProfile(next));
  }, []);

  return profile;
}
