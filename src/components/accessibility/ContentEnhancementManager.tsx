'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccessibilityV2 } from '@/context/AccessibilityContextV2';

/**
 * ContentEnhancementManager - Enhances content for better understanding
 * - Link tooltips showing destination
 * - Definition tooltips for complex words
 * - Image descriptions (alt text overlays)
 * - Simplified language mode
 * - Reading level indicator
 * - Content summary
 */

interface Tooltip {
  text: string;
  x: number;
  y: number;
}

export default function ContentEnhancementManager() {
  const a11y = useAccessibilityV2();
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [contentSummary, setContentSummary] = useState<string>('');
  const [readingLevel, setReadingLevel] = useState<{ grade: number; score: number } | null>(null);

  // Get word definition (simplified - could use external API)
  const getDefinition = useCallback(async (word: string): Promise<string | null> => {
    // This is a placeholder. In production, you'd use a dictionary API like:
    // - Free Dictionary API
    // - Merriam-Webster API
    // - Oxford Dictionary API
    
    const commonDefinitions: Record<string, string> = {
      accessibility: 'The quality of being easy to use or understand',
      navigate: 'Find your way to a destination',
      contrast: 'The difference in brightness between colors',
      magnify: 'Make something appear larger',
      synthesize: 'Combine elements to form a whole',
      cognitive: 'Related to mental processes of understanding',
    };

    return commonDefinitions[word.toLowerCase()] || null;
  }, []);

  const countSyllables = useCallback((word: string): number => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
  }, []);

  // Link tooltips - show destination on hover
  useEffect(() => {
    if (!a11y.linkTooltips) return;

    const handleLinkHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link) {
        const href = link.getAttribute('href');
        const title = link.getAttribute('title');
        const ariaLabel = link.getAttribute('aria-label');
        
        const tooltipText = title || ariaLabel || href || 'Link';
        
        setTooltip({
          text: tooltipText,
          x: e.clientX,
          y: e.clientY - 40,
        });
      }
    };

    const handleLinkLeave = () => {
      setTooltip(null);
    };

    document.addEventListener('mouseover', handleLinkHover);
    document.addEventListener('mouseout', handleLinkLeave);

    return () => {
      document.removeEventListener('mouseover', handleLinkHover);
      document.removeEventListener('mouseout', handleLinkLeave);
    };
  }, [a11y.linkTooltips]);

  // Definition tooltips - show definitions for complex words
  useEffect(() => {
    if (!a11y.definitionTooltips) return;

    const handleTextSelection = async () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const selectedText = selection.toString().trim();
      if (selectedText.length < 3 || selectedText.length > 50 || /\s/.test(selectedText)) {
        return; // Only single words
      }

      // Get position of selection
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Simple definition (you could integrate a dictionary API here)
      const definition = await getDefinition(selectedText);
      
      if (definition) {
        setTooltip({
          text: definition,
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });

        setTimeout(() => setTooltip(null), 5000);
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, [a11y.definitionTooltips, getDefinition]);

  // Image descriptions - show alt text overlays
  useEffect(() => {
    if (!a11y.imageDescriptions && !a11y.altTextOverlay) return;

    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const alt = img.getAttribute('alt');
      
      if (a11y.altTextOverlay && alt) {
        // Create overlay element
        const overlay = document.createElement('div');
        overlay.className = 'a11y-alt-overlay';
        overlay.textContent = alt;
        overlay.style.cssText = `
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px;
          font-size: 12px;
          pointer-events: none;
        `;
        
        // Make parent relative if not already positioned
        const parent = img.parentElement;
        if (parent) {
          const position = window.getComputedStyle(parent).position;
          if (position === 'static') {
            parent.style.position = 'relative';
          }
          parent.appendChild(overlay);
        }
      }
    });

    return () => {
      document.querySelectorAll('.a11y-alt-overlay').forEach(el => el.remove());
    };
  }, [a11y.imageDescriptions, a11y.altTextOverlay]);

  // Simplified language mode - replace complex words with simpler alternatives
  useEffect(() => {
    if (!a11y.simplifiedLanguage) return;

    const simplifications: Record<string, string> = {
      'utilize': 'use',
      'demonstrate': 'show',
      'approximately': 'about',
      'commence': 'start',
      'terminate': 'end',
      'purchase': 'buy',
      'acquire': 'get',
      'assist': 'help',
      'regarding': 'about',
      'subsequently': 'later',
    };

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script, style, and accessibility widget elements
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          if (parent.closest('[data-accessibility-widget]')) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const originalTexts = new Map<Node, string>();
    let node: Node | null;

    while ((node = walker.nextNode())) {
      if (node.textContent) {
        originalTexts.set(node, node.textContent);
        
        let text = node.textContent;
        Object.entries(simplifications).forEach(([complex, simple]) => {
          const regex = new RegExp(`\\b${complex}\\b`, 'gi');
          text = text.replace(regex, simple);
        });
        node.textContent = text;
      }
    }

    return () => {
      // Restore original text
      originalTexts.forEach((original, node) => {
        node.textContent = original;
      });
    };
  }, [a11y.simplifiedLanguage]);

  // Reading level indicator - calculate Flesch-Kincaid grade level
  const calculateReadingLevel = useCallback(() => {
    if (!a11y.readingLevel) return;

    const text = document.body.textContent || '';
    
    // Simple Flesch-Kincaid calculation
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const syllables = text.split(/\s+/).reduce((count, word) => {
      return count + countSyllables(word);
    }, 0);

    if (words === 0 || sentences === 0) return;

    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    // Flesch-Kincaid Grade Level formula
    const gradeLevel = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
    
    // Flesch Reading Ease score
    const readingEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    setReadingLevel({
      grade: Math.max(0, Math.round(gradeLevel)),
      score: Math.max(0, Math.min(100, Math.round(readingEase))),
    });
  }, [a11y.readingLevel, countSyllables]);

  // Content summary - generate page summary
  const generateContentSummary = useCallback(() => {
    if (!a11y.contentSummary) return;

    const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
    const summaryParts: string[] = [];

    headings.slice(0, 5).forEach(h => {
      const text = h.textContent?.trim();
      if (text) {
        summaryParts.push(text);
      }
    });

    if (summaryParts.length > 0) {
      setContentSummary(summaryParts.join(' • '));
    } else {
      setContentSummary('Page content summary not available');
    }
  }, [a11y.contentSummary]);

  // Calculate reading level and summary on mount and content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (a11y.readingLevel) {
        calculateReadingLevel();
      }
      if (a11y.contentSummary) {
        generateContentSummary();
      }
    }, 0);

    const observer = new MutationObserver(() => {
      if (a11y.readingLevel) calculateReadingLevel();
      if (a11y.contentSummary) generateContentSummary();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [a11y.readingLevel, a11y.contentSummary, calculateReadingLevel, generateContentSummary]);

  // Render tooltip
  const renderTooltip = () => {
    if (!tooltip) return null;

    return (
      <div
        style={{
          position: 'fixed',
          left: `${tooltip.x}px`,
          top: `${tooltip.y}px`,
          transform: 'translate(-50%, -100%)',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '13px',
          maxWidth: '300px',
          zIndex: 10000,
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          wordWrap: 'break-word',
        }}
      >
        {tooltip.text}
        <div
          style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(0, 0, 0, 0.9)',
          }}
        />
      </div>
    );
  };

  // Render reading level indicator
  const renderReadingLevel = () => {
    if (!a11y.readingLevel || !readingLevel) return null;

    const getReadingLevelLabel = (grade: number) => {
      if (grade <= 5) return 'Elementary';
      if (grade <= 8) return 'Middle School';
      if (grade <= 12) return 'High School';
      return 'College';
    };

    const getScoreColor = (score: number) => {
      if (score >= 90) return '#4caf50'; // Very easy
      if (score >= 80) return '#8bc34a'; // Easy
      if (score >= 70) return '#ffc107'; // Fairly easy
      if (score >= 60) return '#ff9800'; // Standard
      if (score >= 50) return '#ff5722'; // Fairly difficult
      return '#f44336'; // Difficult
    };

    return (
      <div
        style={{
          position: 'fixed',
          top: '80px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid #2196f3',
          borderRadius: '8px',
          padding: '12px 16px',
          zIndex: 9996,
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          fontSize: '13px',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '8px', color: '#1976d2' }}>
          Reading Level
        </div>
        <div style={{ marginBottom: '4px' }}>
          Grade: <strong>{readingLevel.grade}</strong> ({getReadingLevelLabel(readingLevel.grade)})
        </div>
        <div>
          Ease Score: <strong style={{ color: getScoreColor(readingLevel.score) }}>
            {readingLevel.score}/100
          </strong>
        </div>
      </div>
    );
  };

  // Render content summary
  const renderContentSummary = () => {
    if (!a11y.contentSummary || !contentSummary) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(103, 58, 183, 0.95)',
          color: 'white',
          borderRadius: '8px',
          padding: '12px 20px',
          zIndex: 9996,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          fontSize: '14px',
          maxWidth: '80%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Page Summary</div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>{contentSummary}</div>
      </div>
    );
  };

  return (
    <>
      {renderTooltip()}
      {renderReadingLevel()}
      {renderContentSummary()}
    </>
  );
}
