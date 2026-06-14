'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccessibilityV2 } from '@/context/AccessibilityContextV2';

/**
 * VirtualMouseManager - Keyboard-controlled mouse cursor
 * Allows users with motor disabilities to control mouse with keyboard
 * 
 * Keyboard Controls:
 * - Arrow Keys: Move cursor
 * - Enter/Space: Click
 * - Shift+Enter: Right click
 * - Ctrl+Arrow: Move faster
 * - Tab: Focus next element
 * - Escape: Disable virtual mouse
 */

export default function VirtualMouseManager() {
  const a11y = useAccessibilityV2();
  // Initialize with safe defaults for SSR, update on mount
  const [cursorPos, setCursorPos] = useState({ x: 400, y: 300 });
  const [isClicking, setIsClicking] = useState(false);
  const [speed, setSpeed] = useState(10); // pixels per keypress
  const [isMounted, setIsMounted] = useState(false);

  // Set actual window dimensions on mount (client-side only)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        setCursorPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        setIsMounted(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const moveCursor = useCallback((dx: number, dy: number, fast: boolean = false) => {
    if (typeof window === 'undefined') return;
    
    setCursorPos(prev => {
      const multiplier = fast ? 3 : 1;
      const newX = Math.max(0, Math.min(window.innerWidth - 1, prev.x + dx * speed * multiplier));
      const newY = Math.max(0, Math.min(window.innerHeight - 1, prev.y + dy * speed * multiplier));
      
      // Update actual mouse position (dispatch mouse events)
      const element = document.elementFromPoint(newX, newY);
      if (element) {
        element.dispatchEvent(new MouseEvent('mousemove', {
          clientX: newX,
          clientY: newY,
          bubbles: true,
          cancelable: true,
        }));
      }
      
      return { x: newX, y: newY };
    });
  }, [speed]);

  const clickAtCursor = useCallback((rightClick: boolean = false) => {
    const element = document.elementFromPoint(cursorPos.x, cursorPos.y);
    
    if (element) {
      setIsClicking(true);
      
      // Dispatch click events
      if (rightClick) {
        element.dispatchEvent(new MouseEvent('contextmenu', {
          clientX: cursorPos.x,
          clientY: cursorPos.y,
          bubbles: true,
          cancelable: true,
        }));
      } else {
        element.dispatchEvent(new MouseEvent('mousedown', {
          clientX: cursorPos.x,
          clientY: cursorPos.y,
          bubbles: true,
          cancelable: true,
        }));
        
        setTimeout(() => {
          element.dispatchEvent(new MouseEvent('mouseup', {
            clientX: cursorPos.x,
            clientY: cursorPos.y,
            bubbles: true,
            cancelable: true,
          }));
          
          element.dispatchEvent(new MouseEvent('click', {
            clientX: cursorPos.x,
            clientY: cursorPos.y,
            bubbles: true,
            cancelable: true,
          }));
          
          // If it's a link or button, trigger it
          if (element instanceof HTMLAnchorElement || element instanceof HTMLButtonElement) {
            element.click();
          }
        }, 100);
      }
      
      setTimeout(() => setIsClicking(false), 200);
    }
  }, [cursorPos]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!a11y.virtualMouse) return;

    const fast = e.ctrlKey;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        moveCursor(0, -1, fast);
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveCursor(0, 1, fast);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        moveCursor(-1, 0, fast);
        break;
      case 'ArrowRight':
        e.preventDefault();
        moveCursor(1, 0, fast);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        clickAtCursor(e.shiftKey);
        break;
      case 'Escape':
        e.preventDefault();
        a11y.setVirtualMouse(false);
        break;
      case '+':
      case '=':
        if (e.ctrlKey) {
          e.preventDefault();
          setSpeed(prev => Math.min(50, prev + 5));
        }
        break;
      case '-':
      case '_':
        if (e.ctrlKey) {
          e.preventDefault();
          setSpeed(prev => Math.max(5, prev - 5));
        }
        break;
    }
  }, [a11y, moveCursor, clickAtCursor]);

  useEffect(() => {
    if (!a11y.virtualMouse) return;

    document.addEventListener('keydown', handleKeyDown);
    
    // Hide actual mouse cursor when virtual mouse is active
    document.body.style.cursor = 'none';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.cursor = '';
    };
  }, [a11y.virtualMouse, handleKeyDown]);

  if (!a11y.virtualMouse) {
    return null;
  }

  return (
    <>
      {/* Virtual cursor */}
      <div
        style={{
          position: 'fixed',
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          width: '24px',
          height: '24px',
          pointerEvents: 'none',
          zIndex: 10001,
          transform: 'translate(-4px, -4px)',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            transform: isClicking ? 'scale(0.9)' : 'scale(1)',
            transition: 'transform 0.1s ease',
          }}
        >
          <path
            d="M3 3 L3 17 L7 13 L10 19 L13 18 L10 12 L15 12 Z"
            fill={isClicking ? '#f44336' : '#2196f3'}
            stroke="white"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Click ripple effect */}
      {isClicking && (
        <div
          style={{
            position: 'fixed',
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '2px solid #2196f3',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 10000,
            animation: 'virtual-mouse-click 0.4s ease-out',
          }}
        />
      )}

      {/* Control panel */}
      <div
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          background: 'rgba(33, 150, 243, 0.95)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 9997,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          minWidth: '200px',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
          Virtual Mouse Active
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Arrow Keys:</strong> Move cursor
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Ctrl+Arrows:</strong> Fast move
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Enter/Space:</strong> Click
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Shift+Enter:</strong> Right click
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Escape:</strong> Exit
        </div>
        <div style={{ 
          paddingTop: '8px', 
          borderTop: '1px solid rgba(255,255,255,0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>Speed:</span>
          <span style={{ fontWeight: 600 }}>{speed}px</span>
        </div>
        <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>
          (Ctrl+/- to adjust)
        </div>
      </div>

      <style jsx global>{`
        @keyframes virtual-mouse-click {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
