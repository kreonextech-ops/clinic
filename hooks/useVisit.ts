'use client';

import { useState, useEffect } from 'react';
import type { VisitWithDetails } from '@/types/visit';

export function useVisit(id: string) {
  const [visit, setVisit] = useState<VisitWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchVisit() {
    setLoading(true);
    const res = await fetch(`/api/visits/${id}`);
    if (res.ok) setVisit(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchVisit(); }, [id]);

  return { visit, loading, refresh: fetchVisit };
}
