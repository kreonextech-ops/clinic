'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: any = null;
    let rafId: number;

    import('lenis')
      .then((LenisModule) => {
        const Lenis = LenisModule.default || LenisModule;
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });

        function raf(time: number) {
          lenis?.raf(time);
          rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);
      })
      .catch((err) => {
        console.warn('Lenis smooth scroll fallback:', err);
      });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);

  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  );
}
