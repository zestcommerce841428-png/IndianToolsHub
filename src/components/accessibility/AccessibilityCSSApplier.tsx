'use client';

import { useEffect } from 'react';
import { useAccessibilityV3 } from '@/context/AccessibilityContextV3';

/**
 * AccessibilityCSSApplier
 * Dynamically applies CSS classes to body based on accessibility settings
 */
export default function AccessibilityCSSApplier() {
  const ctx = useAccessibilityV3();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const body = document.body;
    
    // Clear all accessibility classes
    const a11yClasses = Array.from(body.classList).filter(c => c.startsWith('a11y-'));
    a11yClasses.forEach(c => body.classList.remove(c));

    // Vision & Display
    if (ctx.textSize !== 100) {
      body.style.fontSize = `${ctx.textSize}%`;
    } else {
      body.style.fontSize = '';
    }

    if (ctx.lineHeight !== 'normal') {
      body.classList.add(`a11y-line-height-${ctx.lineHeight}`);
    }

    if (ctx.letterSpacing !== 'normal') {
      body.classList.add(`a11y-letter-spacing-${ctx.letterSpacing}`);
    }

    if (ctx.fontFamily !== 'default') {
      body.classList.add(`a11y-font-${ctx.fontFamily}`);
    }

    if (ctx.highContrast) {
      body.classList.add('a11y-high-contrast');
    }

    if (ctx.darkMode) {
      body.classList.add('a11y-dark-mode');
    }

    if (ctx.invertColors) {
      body.classList.add('a11y-invert-colors');
    }

    if (ctx.grayscale) {
      body.classList.add('a11y-grayscale');
    }

    if (ctx.brightness !== 100 || ctx.saturation !== 100) {
      body.style.filter = `brightness(${ctx.brightness}%) saturate(${ctx.saturation}%)`;
    } else if (!ctx.invertColors && !ctx.grayscale) {
      body.style.filter = '';
    }

    if (ctx.focusIndicators) {
      body.classList.add('a11y-focus-indicators');
    }

    if (ctx.colorblindFilter !== 'none') {
      body.classList.add(`a11y-filter-${ctx.colorblindFilter}`);
    }

    // Reading & Content
    if (ctx.readingRuler) {
      body.classList.add('a11y-reading-ruler');
    }

    if (ctx.readingMask) {
      body.classList.add('a11y-reading-mask');
    }

    if (ctx.linkHighlighting) {
      body.classList.add('a11y-link-highlighting');
    }

    if (ctx.simplifyFonts) {
      body.classList.add('a11y-simplify-fonts');
    }

    if (ctx.removeAnimations) {
      body.classList.add('a11y-no-animations');
    }

    if (ctx.pauseAutoplay) {
      body.classList.add('a11y-pause-autoplay');
      // Pause all videos and audio
      document.querySelectorAll('video, audio').forEach((media) => {
        if (media instanceof HTMLMediaElement) {
          media.pause();
        }
      });
    }

    if (ctx.hideImages) {
      body.classList.add('a11y-hide-images');
    }

    if (ctx.removeBackgrounds) {
      body.classList.add('a11y-remove-backgrounds');
    }

    if (ctx.textAlignment !== 'left') {
      body.classList.add(`a11y-text-${ctx.textAlignment}`);
    }

    // Navigation & Control
    if (ctx.largeCursor) {
      body.classList.add('a11y-large-cursor');
    }

    if (ctx.cursorCrosshair) {
      body.classList.add('a11y-cursor-crosshair');
    }

    if (ctx.tabOrderDisplay) {
      body.classList.add('a11y-tab-order');
    }

    if (ctx.skipLinksVisible) {
      body.classList.add('a11y-skip-links-visible');
    }

    if (ctx.stickyHeader) {
      body.classList.add('a11y-sticky-header');
    }

    // Layout & Structure
    if (ctx.headingOutline) {
      body.classList.add('a11y-heading-outline');
    }

    if (ctx.buttonHighlighting) {
      body.classList.add('a11y-button-highlight');
    }

    if (ctx.whiteSpace !== 100) {
      body.style.padding = `${ctx.whiteSpace}%`;
    }

    if (ctx.contentWidth !== 'full') {
      body.classList.add(`a11y-content-${ctx.contentWidth}`);
    }

    if (ctx.responsiveTextFlow) {
      body.classList.add('a11y-responsive-text');
    }

    // Motor & Interaction
    if (ctx.bigButtonMode) {
      body.classList.add('a11y-big-buttons');
    }

    if (ctx.touchTargetSize) {
      body.classList.add('a11y-touch-targets');
    }

    if (ctx.disableDoubleClick) {
      body.classList.add('a11y-no-double-click');
    }

    if (ctx.hoverFreeze) {
      body.classList.add('a11y-hover-freeze');
    }

    if (ctx.oneHandMode) {
      body.classList.add('a11y-one-hand-mode');
    }

  }, [
    ctx.textSize,
    ctx.lineHeight,
    ctx.letterSpacing,
    ctx.fontFamily,
    ctx.highContrast,
    ctx.darkMode,
    ctx.invertColors,
    ctx.grayscale,
    ctx.brightness,
    ctx.saturation,
    ctx.focusIndicators,
    ctx.colorblindFilter,
    ctx.readingRuler,
    ctx.readingMask,
    ctx.linkHighlighting,
    ctx.simplifyFonts,
    ctx.removeAnimations,
    ctx.pauseAutoplay,
    ctx.hideImages,
    ctx.removeBackgrounds,
    ctx.textAlignment,
    ctx.largeCursor,
    ctx.cursorCrosshair,
    ctx.tabOrderDisplay,
    ctx.skipLinksVisible,
    ctx.stickyHeader,
    ctx.headingOutline,
    ctx.buttonHighlighting,
    ctx.whiteSpace,
    ctx.contentWidth,
    ctx.responsiveTextFlow,
    ctx.bigButtonMode,
    ctx.touchTargetSize,
    ctx.disableDoubleClick,
    ctx.hoverFreeze,
    ctx.oneHandMode,
  ]);

  // Scroll to top button
  useEffect(() => {
    if (!ctx.scrollToTop || typeof document === 'undefined') return;

    const button = document.createElement('button');
    button.className = 'a11y-scroll-top-btn';
    button.innerHTML = '↑';
    button.setAttribute('aria-label', 'Scroll to top');
    button.onclick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Show/hide based on scroll
    const handleScroll = () => {
      if (window.scrollY > 300) {
        button.style.opacity = '1';
        button.style.pointerEvents = 'auto';
      } else {
        button.style.opacity = '0';
        button.style.pointerEvents = 'none';
      }
    };

    button.style.opacity = '0';
    button.style.pointerEvents = 'none';
    document.body.appendChild(button);
    window.addEventListener('scroll', handleScroll);

    return () => {
      button.remove();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [ctx.scrollToTop]);

  // Text-to-speech on selection
  useEffect(() => {
    if (!ctx.textToSpeech || typeof window === 'undefined') return;

    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      if (text && text.length > 0) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = ctx.speechRate;
        utterance.voice = window.speechSynthesis.getVoices().find(
          v => v.name.toLowerCase().includes(ctx.speechVoice)
        ) || null;
        
        window.speechSynthesis.speak(utterance);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
      window.speechSynthesis.cancel();
    };
  }, [ctx.textToSpeech, ctx.speechRate, ctx.speechVoice]);

  // Auto-read headings
  useEffect(() => {
    if (!ctx.autoReadHeadings || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.textContent) {
            const utterance = new SpeechSynthesisUtterance(entry.target.textContent);
            utterance.rate = ctx.speechRate;
            window.speechSynthesis.speak(utterance);
          }
        });
      },
      { threshold: 0.8 }
    );

    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
      observer.observe(heading);
    });

    return () => {
      observer.disconnect();
    };
  }, [ctx.autoReadHeadings, ctx.speechRate]);

  // Keyboard navigation
  useEffect(() => {
    if (!ctx.keyboardNavigation || typeof document === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow key navigation
      if (e.altKey) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          window.scrollBy({ top: -100, behavior: 'smooth' });
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          window.scrollBy({ top: 100, behavior: 'smooth' });
        } else if (e.key === 'Home') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (e.key === 'End') {
          e.preventDefault();
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ctx.keyboardNavigation]);

  return null; // This component doesn't render anything
}
