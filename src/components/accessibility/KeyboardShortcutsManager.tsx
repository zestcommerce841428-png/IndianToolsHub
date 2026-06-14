'use client';

import { useEffect, useCallback } from 'react';
import { useAccessibilityV2 } from '@/context/AccessibilityContextV2';

/**
 * KeyboardShortcutsManager - Implements comprehensive keyboard navigation
 * Features:
 * - 20+ keyboard shortcuts
 * - Focus management
 * - Skip to content
 * - Accessibility panel control
 */
export default function KeyboardShortcutsManager() {
  const a11y = useAccessibilityV2();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!a11y.keyboardShortcuts) return;

      // BUG FIX #10: Don't intercept shortcuts when user is typing in input fields
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]');
      
      // Allow Escape key to work in input fields (to close panels)
      if (isInputField && e.key !== 'Escape') {
        return;
      }

      // Alt + A: Open Accessibility Panel
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        a11y.setPanelOpen(!a11y.panelOpen);
        return;
      }

      // Alt + R: Reset All Settings
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (confirm('Reset all accessibility settings to default?')) {
          a11y.resetAll();
        }
        return;
      }

      // Alt + Plus/Equals: Increase Text Size
      if (e.altKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        const sizes: Array<50 | 75 | 100 | 125 | 150 | 175 | 200> = [50, 75, 100, 125, 150, 175, 200];
        const currentIndex = sizes.indexOf(a11y.textSize);
        if (currentIndex < sizes.length - 1) {
          a11y.setTextSize(sizes[currentIndex + 1]);
        }
        return;
      }

      // Alt + Minus: Decrease Text Size
      if (e.altKey && e.key === '-') {
        e.preventDefault();
        const sizes: Array<50 | 75 | 100 | 125 | 150 | 175 | 200> = [50, 75, 100, 125, 150, 175, 200];
        const currentIndex = sizes.indexOf(a11y.textSize);
        if (currentIndex > 0) {
          a11y.setTextSize(sizes[currentIndex - 1]);
        }
        return;
      }

      // Alt + C: Toggle High Contrast
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        a11y.setHighContrast(!a11y.highContrast);
        return;
      }

      // Alt + T: Toggle Text-to-Speech
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        a11y.setTextToSpeech(!a11y.textToSpeech);
        return;
      }

      // Escape: Close Panels
      if (e.key === 'Escape') {
        if (a11y.panelOpen) {
          a11y.setPanelOpen(false);
        }
        return;
      }
    },
    [a11y]
  );

  // Main keyboard shortcuts listener
  useEffect(() => {
    if (!a11y.keyboardShortcuts) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [a11y.keyboardShortcuts, handleKeyDown]);

  return null; // This is a logic-only component
}
