'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAccessibilityV2 } from '@/context/AccessibilityContextV2';

/**
 * CursorEffectsManager - Implements interactive cursor enhancements
 * Features:
 * - Cursor trail effect
 * - Click ripple animations
 * - Cursor crosshair overlay
 */
export default function CursorEffectsManager() {
  const a11y = useAccessibilityV2();
  const [trails, setTrails] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const trailIdRef = useRef(0);
  const rippleIdRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Cursor Trail Effect
  useEffect(() => {
    if (!a11y.cursorTrail) return;

    let lastX = 0;
    let lastY = 0;
    let frameCount = 0;

    const handleMouseMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;

      // Throttle trail creation (every 3 frames)
      frameCount++;
      if (frameCount % 3 !== 0) return;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const id = ++trailIdRef.current;
        setTrails(prev => {
          // Keep only last 10 trails for performance
          const newTrails = [...prev, { id, x: lastX, y: lastY }];
          return newTrails.slice(-10);
        });

        // Remove trail after animation completes
        setTimeout(() => {
          setTrails(prev => prev.filter(t => t.id !== id));
        }, 600);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [a11y.cursorTrail]);

  // Click Animation Effect
  useEffect(() => {
    if (!a11y.clickAnimation) return;

    const handleClick = (e: MouseEvent) => {
      const id = ++rippleIdRef.current;
      setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [a11y.clickAnimation]);

  return (
    <>
      {/* Cursor Trails */}
      {trails.map(trail => (
        <div
          key={trail.id}
          className="a11y-cursor-trail"
          style={{
            left: `${trail.x - 10}px`,
            top: `${trail.y - 10}px`,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Click Ripples */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="a11y-click-ripple"
          style={{
            left: `${ripple.x - 100}px`,
            top: `${ripple.y - 100}px`,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Cursor Crosshair Overlay */}
      {a11y.cursorCrosshair && (
        <style jsx global>{`
          body::before,
          body::after {
            content: '';
            position: fixed;
            background: rgba(255, 107, 0, 0.4);
            pointer-events: none;
            z-index: 9999;
          }
          body::before {
            left: 0;
            right: 0;
            top: 50%;
            height: 1px;
            transform: translateY(-50%);
          }
          body::after {
            top: 0;
            bottom: 0;
            left: 50%;
            width: 1px;
            transform: translateX(-50%);
          }
        `}</style>
      )}
    </>
  );
}
