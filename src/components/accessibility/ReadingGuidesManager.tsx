'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAccessibilityV2 } from '@/context/AccessibilityContextV2';

/**
 * ReadingGuidesManager - Implements real-time reading assistance overlays
 * Features:
 * - Reading Ruler: Yellow horizontal band following cursor
 * - Reading Mask: Focus slit with dimmed surroundings
 * - Reading Spotlight: Circular spotlight following cursor
 * - Dyslexia Ruler: Blue-tinted ruler with special spacing
 */
export default function ReadingGuidesManager() {
  const a11y = useAccessibilityV2();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Use RAF for smooth performance
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        lastX = e.clientX;
        lastY = e.clientY;
        setMousePos({ x: lastX, y: lastY });
      });
    };

    // Only attach listener if any reading guide is active
    if (
      a11y.readingRuler ||
      a11y.readingMask ||
      a11y.readingSpotlight ||
      a11y.dyslexiaRuler
    ) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [a11y.readingRuler, a11y.readingMask, a11y.readingSpotlight, a11y.dyslexiaRuler]);

  return (
    <>
      {/* Reading Ruler */}
      {a11y.readingRuler && (
        <div
          className="a11y-reading-ruler"
          style={{
            top: `${mousePos.y - 30}px`,
            transition: 'top 0.05s linear',
          }}
          aria-hidden="true"
        />
      )}

      {/* Reading Mask (Focus Slit) */}
      {a11y.readingMask && (
        <div
          className="a11y-reading-mask"
          style={{
            background: `
              linear-gradient(to bottom,
                rgba(0, 0, 0, 0.85) 0%,
                rgba(0, 0, 0, 0.85) calc(${mousePos.y}px - 80px),
                transparent calc(${mousePos.y}px - 40px),
                transparent calc(${mousePos.y}px + 40px),
                rgba(0, 0, 0, 0.85) calc(${mousePos.y}px + 80px),
                rgba(0, 0, 0, 0.85) 100%
              )
            `,
            transition: 'background 0.1s ease-out',
          }}
          aria-hidden="true"
        />
      )}

      {/* Reading Spotlight */}
      {a11y.readingSpotlight && (
        <div
          className="a11y-reading-spotlight"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transition: 'left 0.05s linear, top 0.05s linear',
          }}
          aria-hidden="true"
        />
      )}

      {/* Dyslexia Ruler */}
      {a11y.dyslexiaRuler && (
        <div
          className="a11y-dyslexia-ruler"
          style={{
            top: `${mousePos.y - 40}px`,
            transition: 'top 0.05s linear',
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
