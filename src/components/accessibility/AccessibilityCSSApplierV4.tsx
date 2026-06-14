'use client';

import { useEffect } from 'react';
import { useAccessibilityV4 } from '@/context/AccessibilityContextV4';

export default function AccessibilityCSSApplierV4() {
  const { state } = useAccessibilityV4();

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Text & Typography
    root.style.setProperty('--a11y-font-size-adjust', `${state.fontSize}px`);
    root.style.setProperty('--a11y-line-height-adjust', `${state.lineHeight * 0.1}em`);
    root.style.setProperty('--a11y-letter-spacing', `${state.letterSpacing}px`);
    root.style.setProperty('--a11y-word-spacing', `${state.wordSpacing}px`);
    root.style.setProperty('--a11y-paragraph-spacing', `${state.paragraphSpacing * 0.5}em`);

    if (state.dyslexiaFont) {
      body.style.fontFamily = "'Lexend Deca', 'Arial', sans-serif !important";
    } else if (state.readableFont) {
      body.style.fontFamily = "'Verdana', 'Arial', sans-serif !important";
    } else {
      body.style.fontFamily = '';
    }

    if (state.boldText) {
      body.style.fontWeight = 'bold';
    } else {
      body.style.fontWeight = '';
    }

    if (state.alignLeft) {
      body.style.textAlign = 'left';
    } else if (state.alignCenter) {
      body.style.textAlign = 'center';
    } else {
      body.style.textAlign = '';
    }

    // Visual & Display Filters
    const filters: string[] = [];
    
    if (state.monochrome) filters.push('grayscale(100%)');
    if (state.sepia) filters.push('sepia(100%)');
    if (state.invertColors) filters.push('invert(100%)');
    if (state.lowSaturation) filters.push('saturate(0.5)');
    if (state.highSaturation) filters.push('saturate(2)');
    if (state.blueLightFilter) filters.push('sepia(20%) saturate(150%) hue-rotate(-20deg)');
    
    // Color vision filters
    if (state.protanopia) filters.push('url(#protanopia)');
    if (state.deuteranopia) filters.push('url(#deuteranopia)');
    if (state.tritanopia) filters.push('url(#tritanopia)');

    root.style.filter = filters.join(' ');

    // High/Dark/Light Contrast
    if (state.highContrast) {
      body.style.backgroundColor = '#000000';
      body.style.color = '#ffffff';
    } else if (state.darkContrast) {
      body.style.backgroundColor = '#1a1a1a';
      body.style.color = '#ffffff';
    } else if (state.lightContrast) {
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#000000';
    } else {
      body.style.backgroundColor = '';
      body.style.color = '';
    }

    // Content & Navigation
    if (state.highlightLinks) {
      const style = document.getElementById('a11y-highlight-links') || document.createElement('style');
      style.id = 'a11y-highlight-links';
      style.textContent = 'a { outline: 3px solid #ffeb3b !important; outline-offset: 2px !important; }';
      document.head.appendChild(style);
    } else {
      document.getElementById('a11y-highlight-links')?.remove();
    }

    if (state.highlightHeadings) {
      const style = document.getElementById('a11y-highlight-headings') || document.createElement('style');
      style.id = 'a11y-highlight-headings';
      style.textContent = 'h1, h2, h3, h4, h5, h6 { outline: 2px solid #00bcd4 !important; outline-offset: 2px !important; }';
      document.head.appendChild(style);
    } else {
      document.getElementById('a11y-highlight-headings')?.remove();
    }

    if (state.underlineLinks) {
      const style = document.getElementById('a11y-underline-links') || document.createElement('style');
      style.id = 'a11y-underline-links';
      style.textContent = 'a { text-decoration: underline !important; }';
      document.head.appendChild(style);
    } else {
      document.getElementById('a11y-underline-links')?.remove();
    }

    if (state.hideImages) {
      const style = document.getElementById('a11y-hide-images') || document.createElement('style');
      style.id = 'a11y-hide-images';
      style.textContent = 'img, svg, video { filter: blur(10px) opacity(0.3) !important; }';
      document.head.appendChild(style);
    } else {
      document.getElementById('a11y-hide-images')?.remove();
    }

    if (state.stopAnimations) {
      const style = document.getElementById('a11y-stop-animations') || document.createElement('style');
      style.id = 'a11y-stop-animations';
      style.textContent = '*, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }';
      document.head.appendChild(style);
    } else {
      document.getElementById('a11y-stop-animations')?.remove();
    }

    if (state.muteMedia) {
      document.querySelectorAll('video, audio').forEach((el) => {
        (el as HTMLMediaElement).muted = true;
      });
    }

    // Cursor & Reading
    if (state.bigCursor) {
      body.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\'%3E%3Ccircle cx=\'16\' cy=\'16\' r=\'14\' fill=\'%23ff5722\' stroke=\'%23ffffff\' stroke-width=\'2\'/%3E%3C/svg%3E") 16 16, auto';
    } else {
      body.style.cursor = '';
    }

    if (state.readingGuide) {
      const guide = document.getElementById('a11y-reading-guide') || document.createElement('div');
      guide.id = 'a11y-reading-guide';
      guide.style.cssText = 'position: fixed; left: 0; right: 0; height: 3px; background: rgba(255, 87, 34, 0.8); pointer-events: none; z-index: 999999; transition: top 0.1s;';
      document.body.appendChild(guide);
      
      const moveGuide = (e: MouseEvent) => {
        guide.style.top = `${e.clientY}px`;
      };
      document.addEventListener('mousemove', moveGuide);
      
      return () => {
        document.removeEventListener('mousemove', moveGuide);
        guide.remove();
      };
    } else {
      document.getElementById('a11y-reading-guide')?.remove();
    }

    if (state.readingMask) {
      const mask = document.getElementById('a11y-reading-mask') || document.createElement('div');
      mask.id = 'a11y-reading-mask';
      mask.style.cssText = 'position: fixed; left: 0; right: 0; top: 0; bottom: 0; pointer-events: none; z-index: 999998; background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.8) 100%);';
      document.body.appendChild(mask);
    } else {
      document.getElementById('a11y-reading-mask')?.remove();
    }

    if (state.focusIndicator) {
      const style = document.getElementById('a11y-focus-indicator') || document.createElement('style');
      style.id = 'a11y-focus-indicator';
      style.textContent = '*:focus { outline: 4px solid #2196f3 !important; outline-offset: 3px !important; }';
      document.head.appendChild(style);
    } else {
      document.getElementById('a11y-focus-indicator')?.remove();
    }

    if (state.keyboardNav) {
      const style = document.getElementById('a11y-keyboard-nav') || document.createElement('style');
      style.id = 'a11y-keyboard-nav';
      style.textContent = '*:focus-visible { outline: 3px dashed #ff9800 !important; outline-offset: 4px !important; }';
      document.head.appendChild(style);
    } else {
      document.getElementById('a11y-keyboard-nav')?.remove();
    }

    // Spacing & Layout
    if (state.pageZoom !== 0) {
      root.style.zoom = `${100 + state.pageZoom * 10}%`;
    } else {
      root.style.zoom = '';
    }

    if (state.narrowContent) {
      const style = document.getElementById('a11y-narrow-content') || document.createElement('style');
      style.id = 'a11y-narrow-content';
      style.textContent = 'body > * { max-width: 720px !important; margin-left: auto !important; margin-right: auto !important; }';
      document.head.appendChild(style);
    } else {
      document.getElementById('a11y-narrow-content')?.remove();
    }

    // Screen Reader (Text-to-Speech)
    if (state.screenReader) {
      const handleSelection = () => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();
        if (text && text.length > 0) {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
          }
        }
      };
      
      document.addEventListener('mouseup', handleSelection);
      return () => {
        document.removeEventListener('mouseup', handleSelection);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      };
    }

    // Apply all CSS custom properties
    const styleEl = document.getElementById('a11y-v4-styles') || document.createElement('style');
    styleEl.id = 'a11y-v4-styles';
    styleEl.textContent = `
      body {
        font-size: calc(16px + var(--a11y-font-size-adjust, 0px)) !important;
        line-height: calc(1.5 + var(--a11y-line-height-adjust, 0em)) !important;
        letter-spacing: var(--a11y-letter-spacing, 0px) !important;
        word-spacing: var(--a11y-word-spacing, 0px) !important;
      }
      p {
        margin-bottom: calc(1em + var(--a11y-paragraph-spacing, 0em)) !important;
      }
    `;
    document.head.appendChild(styleEl);

  }, [state]);

  return null;
}
