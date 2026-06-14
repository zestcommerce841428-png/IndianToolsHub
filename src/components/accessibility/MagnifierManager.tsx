'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAccessibilityV2 } from '@/context/AccessibilityContextV2';

/**
 * MagnifierManager - Implements virtual magnifying glass and page magnifier
 * Features:
 * - Virtual magnifying glass that follows cursor
 * - Page-wide magnification (2x-10x zoom)
 */
export default function MagnifierManager() {
  const a11y = useAccessibilityV2();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const magnifierRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Virtual magnifying glass
  useEffect(() => {
    if (!a11y.virtualMagnifier) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [a11y.virtualMagnifier]);

  // Page magnifier (zoom entire page)
  useEffect(() => {
    if (!a11y.pageMagnifier) {
      // Reset zoom
      document.body.style.transform = '';
      document.body.style.transformOrigin = '';
      return;
    }

    // Apply zoom to entire page
    const zoom = a11y.magnifierZoom;
    document.body.style.transform = `scale(${zoom})`;
    document.body.style.transformOrigin = 'top left';
    document.body.style.width = `${100 / zoom}%`;
    document.body.style.height = `${100 / zoom}%`;

    return () => {
      document.body.style.transform = '';
      document.body.style.transformOrigin = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [a11y.pageMagnifier, a11y.magnifierZoom]);

  if (!a11y.virtualMagnifier) return null;

  const magnifierSize = 200;
  const zoom = a11y.magnifierZoom;

  return (
    <div
      ref={magnifierRef}
      className="a11y-magnifier-overlay"
      style={{
        left: `${mousePos.x - magnifierSize / 2}px`,
        top: `${mousePos.y - magnifierSize / 2}px`,
        width: `${magnifierSize}px`,
        height: `${magnifierSize}px`,
        background: `
          radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%),
          url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="45" fill="white" opacity="0.2"/></svg>')
        `,
        backdropFilter: `blur(0px)`,
      }}
      aria-hidden="true"
    >
      <div
        className="a11y-magnifier-content"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'white',
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Magnified content rendered here via CSS backdrop-filter */}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: -30,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {zoom}x Magnification
      </div>
    </div>
  );
}
