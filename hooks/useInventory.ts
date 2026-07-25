'use client';

import { useState, useEffect } from 'react';
import type { InventoryItem } from '@/types/inventory';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchItems() {
    const res = await fetch('/api/inventory');
    if (res.ok) {
      const data = await res.json();
      setItems(data.map((item: InventoryItem) => ({
        ...item,
        isLowStock: parseFloat(item.quantity) <= parseFloat(item.lowStockThreshold),
      })));
    }
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []);

  return { items, loading, refresh: fetchItems };
}
