'use client';

import { useState, useEffect } from 'react';
import type { FollowUpWithPatient } from '@/types/follow-up';

export function useFollowUps(status?: string) {
  const [followUps, setFollowUps] = useState<FollowUpWithPatient[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchFollowUps() {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    const res = await fetch(`/api/follow-ups?${params}`);
    if (res.ok) setFollowUps(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchFollowUps(); }, [status]);

  return { followUps, loading, refresh: fetchFollowUps };
}
