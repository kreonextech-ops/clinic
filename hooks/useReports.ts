'use client';

import { useState, useEffect } from 'react';

export function useReport<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(endpoint)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, loading };
}
