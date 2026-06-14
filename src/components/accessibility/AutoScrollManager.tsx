'use client';

import { useEffect, useRef } from 'react';
import { useAccessibilityV2 } from '@/context/AccessibilityContextV2';

/**
 * AutoScrollManager - Implements automatic page scrolling
 * Useful for users with motor disabilities who have difficulty scrolling
 */
export default function AutoScrollManager() {
  const a11y = useAccessibilityV2();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (!a11y.autoScroll) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Calculate scroll speed (1-10 scale to pixels per interval)
    // Speed 1 = 1px/100ms (slowest), Speed 10 = 10px/100ms (fastest)
    const pixelsPerInterval = a11y.autoScrollSpeed;
    const intervalMs = 100;

    // Pause on mouse movement
    const handleMouseMove = () => {
      pausedRef.current = true;
      setTimeout(() => {
        pausedRef.current = false;
      }, 2000); // Resume after 2 seconds of no movement
    };

    // Pause on scroll wheel
    const handleWheel = () => {
      pausedRef.current = true;
      setTimeout(() => {
        pausedRef.current = false;
      }, 3000); // Resume after 3 seconds
    };

    // Start auto-scrolling
    intervalRef.current = setInterval(() => {
      if (pausedRef.current) return;

      const currentScroll = window.pageYOffset;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (currentScroll >= maxScroll) {
        // Reached bottom, stop or loop back to top
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        // Optionally scroll back to top after 2 seconds
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 2000);
      } else {
        window.scrollBy({
          top: pixelsPerInterval,
          behavior: 'auto',
        });
      }
    }, intervalMs);

    // Add pause listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [a11y.autoScroll, a11y.autoScrollSpeed]);

  return null; // Logic-only component
}
