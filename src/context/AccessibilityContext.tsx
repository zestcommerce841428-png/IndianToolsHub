'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontScale = 'small' | 'normal' | 'large' | 'extra-large';
export type LineHeightScale = 'normal' | 'large' | 'extra-large';
export type WordSpacingScale = 'normal' | 'large' | 'extra-large';
export type TextAlignOverride = 'none' | 'left' | 'center' | 'right' | 'justify';
export type FontFamilyOverride = 'none' | 'serif' | 'sans-serif' | 'monospace' | 'dyslexic';
export type ColorBlindnessType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochromacy';
export type HighContrastTheme = 'none' | 'black-yellow' | 'black-white' | 'white-black' | 'yellow-black' | 'green-black' | 'solarized';
export type TtsSpeed = 'slow' | 'medium' | 'fast';
export type TtsPitch = 'low' | 'medium' | 'high';

interface AccessibilityContextType {
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  lineHeightScale: LineHeightScale;
  setLineHeightScale: (scale: LineHeightScale) => void;
  wordSpacingScale: WordSpacingScale;
  setWordSpacingScale: (scale: WordSpacingScale) => void;
  textAlign: TextAlignOverride;
  setTextAlign: (align: TextAlignOverride) => void;
  fontFamilyOverride: FontFamilyOverride;
  setFontFamilyOverride: (font: FontFamilyOverride) => void;
  colorBlindness: ColorBlindnessType;
  setColorBlindness: (type: ColorBlindnessType) => void;
  highContrastTheme: HighContrastTheme;
  setHighContrastTheme: (theme: HighContrastTheme) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  dyslexiaFont: boolean;
  setDyslexiaFont: (val: boolean) => void;
  grayscaleMode: boolean;
  setGrayscaleMode: (val: boolean) => void;
  underlineLinks: boolean;
  setUnderlineLinks: (val: boolean) => void;
  textSpacing: boolean;
  setTextSpacing: (val: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (val: boolean) => void;
  largeCursor: boolean;
  setLargeCursor: (val: boolean) => void;
  readingGuide: boolean;
  setReadingGuide: (val: boolean) => void;
  invertColors: boolean;
  setInvertColors: (val: boolean) => void;
  textToSpeech: boolean;
  setTextToSpeech: (val: boolean) => void;
  screenRuler: boolean;
  setScreenRuler: (val: boolean) => void;
  magnifierMode: boolean;
  setMagnifierMode: (val: boolean) => void;
  bigButtonMode: boolean;
  setBigButtonMode: (val: boolean) => void;
  keyboardShortcuts: boolean;
  setKeyboardShortcuts: (val: boolean) => void;
  readingMask: boolean;
  setReadingMask: (val: boolean) => void;
  altTextOverlay: boolean;
  setAltTextOverlay: (val: boolean) => void;
  linkDestinationDisplay: boolean;
  setLinkDestinationDisplay: (val: boolean) => void;
  keyboardNavHud: boolean;
  setKeyboardNavHud: (val: boolean) => void;
  removeTextShadows: boolean;
  setRemoveTextShadows: (val: boolean) => void;
  removeBackgrounds: boolean;
  setRemoveBackgrounds: (val: boolean) => void;
  pauseAnimations: boolean;
  setPauseAnimations: (val: boolean) => void;
  highlightHeaders: boolean;
  setHighlightHeaders: (val: boolean) => void;
  stickyHeader: boolean;
  setStickyHeader: (val: boolean) => void;
  ttsSpeed: TtsSpeed;
  setTtsSpeed: (speed: TtsSpeed) => void;
  ttsPitch: TtsPitch;
  setTtsPitch: (pitch: TtsPitch) => void;
  audioMono: boolean;
  setAudioMono: (val: boolean) => void;
  seizureShield: boolean;
  setSeizureShield: (val: boolean) => void;
  resetAll: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontScale, setFontScaleState] = useState<FontScale>('normal');
  const [lineHeightScale, setLineHeightScaleState] = useState<LineHeightScale>('normal');
  const [wordSpacingScale, setWordSpacingScaleState] = useState<WordSpacingScale>('normal');
  const [textAlign, setTextAlignState] = useState<TextAlignOverride>('none');
  const [fontFamilyOverride, setFontFamilyOverrideState] = useState<FontFamilyOverride>('none');
  const [colorBlindness, setColorBlindnessState] = useState<ColorBlindnessType>('none');
  const [highContrastTheme, setHighContrastThemeState] = useState<HighContrastTheme>('none');
  const [highContrast, setHighContrastState] = useState(false);
  const [dyslexiaFont, setDyslexiaFontState] = useState(false);
  const [grayscaleMode, setGrayscaleModeState] = useState(false);
  const [underlineLinks, setUnderlineLinksState] = useState(false);
  const [textSpacing, setTextSpacingState] = useState(false);
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [largeCursor, setLargeCursorState] = useState(false);
  const [readingGuide, setReadingGuideState] = useState(false);
  const [invertColors, setInvertColorsState] = useState(false);
  const [textToSpeech, setTextToSpeechState] = useState(false);
  const [screenRuler, setScreenRulerState] = useState(false);
  const [magnifierMode, setMagnifierModeState] = useState(false);
  const [bigButtonMode, setBigButtonModeState] = useState(false);
  const [keyboardShortcuts, setKeyboardShortcutsState] = useState(false);
  const [readingMask, setReadingMaskState] = useState(false);
  const [altTextOverlay, setAltTextOverlayState] = useState(false);
  const [linkDestinationDisplay, setLinkDestinationDisplayState] = useState(false);
  const [keyboardNavHud, setKeyboardNavHudState] = useState(false);
  const [removeTextShadows, setRemoveTextShadowsState] = useState(false);
  const [removeBackgrounds, setRemoveBackgroundsState] = useState(false);
  const [pauseAnimations, setPauseAnimationsState] = useState(false);
  const [highlightHeaders, setHighlightHeadersState] = useState(false);
  const [stickyHeader, setStickyHeaderState] = useState(false);
  const [ttsSpeed, setTtsSpeedState] = useState<TtsSpeed>('medium');
  const [ttsPitch, setTtsPitchState] = useState<TtsPitch>('medium');
  const [audioMono, setAudioMonoState] = useState(false);
  const [seizureShield, setSeizureShieldState] = useState(false);

  // SVG colorblindness filters injector
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let svgFilter = document.getElementById('accessibility-svg-filters');
    if (!svgFilter) {
      svgFilter = document.createElement('div');
      svgFilter.id = 'accessibility-svg-filters';
      svgFilter.innerHTML = `
        <svg style="display:none">
          <defs>
            <filter id="protanopia-filter">
              <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" />
            </filter>
            <filter id="deuteranopia-filter">
              <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" />
            </filter>
            <filter id="tritanopia-filter">
              <feColorMatrix type="matrix" values="0.95, 0.05,  0, 0, 0, 0,  0.433, 0.567, 0, 0, 0,  0.475, 0.525, 0, 0, 0, 0, 0, 1, 0" />
            </filter>
            <filter id="monochromacy-filter">
              <feColorMatrix type="matrix" values="0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0, 0, 0, 1, 0" />
            </filter>
          </defs>
        </svg>
      `;
      document.body.appendChild(svgFilter);
    }
  }, []);

  // 1. Reading Guide Horizontal line
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let guideEl = document.getElementById('accessibility-reading-guide');
    if (readingGuide) {
      if (!guideEl) {
        guideEl = document.createElement('div');
        guideEl.id = 'accessibility-reading-guide';
        guideEl.style.position = 'fixed';
        guideEl.style.left = '0';
        guideEl.style.right = '0';
        guideEl.style.height = '4px';
        guideEl.style.backgroundColor = '#3b82f6';
        guideEl.style.opacity = '0.8';
        guideEl.style.zIndex = '99999';
        guideEl.style.pointerEvents = 'none';
        guideEl.style.boxShadow = '0 0 8px #3b82f6';
        document.body.appendChild(guideEl);
      }
      const updateGuide = (e: MouseEvent) => {
        if (guideEl) guideEl.style.top = `${e.clientY - 2}px`;
      };
      window.addEventListener('mousemove', updateGuide);
      return () => {
        window.removeEventListener('mousemove', updateGuide);
        if (guideEl && document.body.contains(guideEl)) document.body.removeChild(guideEl);
      };
    } else if (guideEl && document.body.contains(guideEl)) {
      document.body.removeChild(guideEl);
    }
  }, [readingGuide]);

  // 2. Reading Mask focus slit
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let maskTop = document.getElementById('accessibility-mask-top');
    let maskBottom = document.getElementById('accessibility-mask-bottom');
    if (readingMask) {
      if (!maskTop) {
        maskTop = document.createElement('div');
        maskTop.id = 'accessibility-mask-top';
        maskTop.style.position = 'fixed';
        maskTop.style.left = '0';
        maskTop.style.right = '0';
        maskTop.style.top = '0';
        maskTop.style.backgroundColor = 'rgba(0,0,0,0.6)';
        maskTop.style.zIndex = '99990';
        maskTop.style.pointerEvents = 'none';
        maskTop.style.height = `${window.innerHeight / 2 - 40}px`;
        document.body.appendChild(maskTop);

        maskBottom = document.createElement('div');
        maskBottom.id = 'accessibility-mask-bottom';
        maskBottom.style.position = 'fixed';
        maskBottom.style.left = '0';
        maskBottom.style.right = '0';
        maskBottom.style.bottom = '0';
        maskBottom.style.backgroundColor = 'rgba(0,0,0,0.6)';
        maskBottom.style.zIndex = '99990';
        maskBottom.style.pointerEvents = 'none';
        maskBottom.style.top = `${window.innerHeight / 2 + 40}px`;
        document.body.appendChild(maskBottom);
      }
      const updateMask = (e: MouseEvent) => {
        if (maskTop && maskBottom) {
          maskTop.style.height = `${e.clientY - 40}px`;
          maskBottom.style.top = `${e.clientY + 40}px`;
        }
      };
      window.addEventListener('mousemove', updateMask);
      return () => {
        window.removeEventListener('mousemove', updateMask);
        if (maskTop && document.body.contains(maskTop)) document.body.removeChild(maskTop);
        if (maskBottom && document.body.contains(maskBottom)) document.body.removeChild(maskBottom);
      };
    } else {
      if (maskTop && document.body.contains(maskTop)) document.body.removeChild(maskTop);
      if (maskBottom && document.body.contains(maskBottom)) document.body.removeChild(maskBottom);
    }
  }, [readingMask]);

  // 3. Screen Ruler band
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let rulerEl = document.getElementById('accessibility-screen-ruler');
    if (screenRuler) {
      if (!rulerEl) {
        rulerEl = document.createElement('div');
        rulerEl.id = 'accessibility-screen-ruler';
        rulerEl.style.position = 'fixed';
        rulerEl.style.left = '0';
        rulerEl.style.right = '0';
        rulerEl.style.height = '40px';
        rulerEl.style.backgroundColor = 'rgba(251, 191, 36, 0.15)';
        rulerEl.style.borderTop = '2px solid #fbbf24';
        rulerEl.style.borderBottom = '2px solid #fbbf24';
        rulerEl.style.zIndex = '99998';
        rulerEl.style.pointerEvents = 'none';
        document.body.appendChild(rulerEl);
      }
      const updateRuler = (e: MouseEvent) => {
        if (rulerEl) rulerEl.style.top = `${e.clientY - 20}px`;
      };
      window.addEventListener('mousemove', updateRuler);
      return () => {
        window.removeEventListener('mousemove', updateRuler);
        if (rulerEl && document.body.contains(rulerEl)) document.body.removeChild(rulerEl);
      };
    } else if (rulerEl && document.body.contains(rulerEl)) {
      document.body.removeChild(rulerEl);
    }
  }, [screenRuler]);

  // 4. Cursor Zoom Magnifier (Smoothly scales focused elements for readability & shows high-contrast reader bar)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (magnifierMode) {
      let hoveredEl: HTMLElement | null = null;
      let readerBar = document.getElementById('accessibility-reader-bar');
      if (!readerBar) {
        readerBar = document.createElement('div');
        readerBar.id = 'accessibility-reader-bar';
        readerBar.style.position = 'fixed';
        readerBar.style.bottom = '24px';
        readerBar.style.left = '50%';
        readerBar.style.transform = 'translateX(-50%)';
        readerBar.style.width = '90%';
        readerBar.style.maxWidth = '800px';
        readerBar.style.backgroundColor = '#0f172a';
        readerBar.style.border = '2px solid #3b82f6';
        readerBar.style.borderRadius = '12px';
        readerBar.style.padding = '16px 24px';
        readerBar.style.color = '#ffffff';
        readerBar.style.fontSize = '1.75rem';
        readerBar.style.fontWeight = 'bold';
        readerBar.style.textAlign = 'center';
        readerBar.style.zIndex = '99999';
        readerBar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(59, 130, 246, 0.4)';
        readerBar.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        readerBar.innerText = 'Hover over any text to view magnifier reader...';
        document.body.appendChild(readerBar);
      }

      const onOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const textElements = ['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'BUTTON', 'LI', 'LABEL'];
        if (target && textElements.includes(target.tagName)) {
          if (hoveredEl) {
            hoveredEl.style.transform = '';
            hoveredEl.style.textShadow = '';
            hoveredEl.style.zIndex = '';
          }
          hoveredEl = target;
          target.style.transition = 'all 0.15s ease';
          target.style.transform = 'scale(1.04)';
          target.style.transformOrigin = 'center left';
          target.style.position = 'relative';
          target.style.zIndex = '9990';
          target.style.textShadow = '0 0 10px rgba(59, 130, 246, 0.45)';

          const text = target.innerText || target.textContent || '';
          if (text.trim() && readerBar) {
            readerBar.innerText = text.trim();
          }
        }
      };
      const onOut = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target === hoveredEl) {
          target.style.transform = '';
          target.style.textShadow = '';
          target.style.zIndex = '';
          hoveredEl = null;
        }
      };
      window.addEventListener('mouseover', onOver);
      window.addEventListener('mouseout', onOut);
      return () => {
        window.removeEventListener('mouseover', onOver);
        window.removeEventListener('mouseout', onOut);
        if (hoveredEl) {
          hoveredEl.style.transform = '';
          hoveredEl.style.textShadow = '';
          hoveredEl.style.zIndex = '';
        }
        if (readerBar) readerBar.remove();
      };
    }
  }, [magnifierMode]);

  // 5. Image Alt text overlay (floating absolute badges that do not break grid/flex card layouts)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!altTextOverlay) return;

    const overlayContainerId = 'accessibility-alt-badges-root';
    let container = document.getElementById(overlayContainerId);
    if (!container) {
      container = document.createElement('div');
      container.id = overlayContainerId;
      container.style.position = 'absolute';
      container.style.left = '0';
      container.style.top = '0';
      container.style.width = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }

    const renderBadges = () => {
      if (!container) return;
      container.innerHTML = '';
      const images = document.querySelectorAll('img');
      images.forEach((img, idx) => {
        const alt = img.getAttribute('alt') || img.title || 'No description';
        const rect = img.getBoundingClientRect();
        if (rect.width > 10 && rect.height > 10) {
          const badge = document.createElement('span');
          badge.className = 'accessibility-alt-badge';
          badge.innerText = `ALT: ${alt}`;
          badge.style.position = 'absolute';
          badge.style.left = `${rect.left + window.scrollX + 8}px`;
          badge.style.top = `${rect.top + window.scrollY + 8}px`;
          badge.style.fontSize = '0.7rem';
          badge.style.backgroundColor = 'rgba(16, 185, 129, 0.9)';
          badge.style.color = '#ffffff';
          badge.style.padding = '2px 6px';
          badge.style.borderRadius = '4px';
          badge.style.fontWeight = 'bold';
          badge.style.pointerEvents = 'auto';
          badge.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
          container.appendChild(badge);
        }
      });
    };

    // Initial render
    setTimeout(renderBadges, 100);

    // Watch for dynamic route transitions or page layout changes
    const observer = new MutationObserver(renderBadges);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener('resize', renderBadges);
    window.addEventListener('scroll', renderBadges);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', renderBadges);
      window.removeEventListener('scroll', renderBadges);
      container?.remove();
    };
  }, [altTextOverlay]);

  // 6. Link target destination helper (with screen edge overflow protection)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (linkDestinationDisplay) {
      const showDest = (e: MouseEvent) => {
        let target = e.target as HTMLElement;
        while (target && target.tagName !== 'A') {
          target = target.parentNode as HTMLElement;
        }
        if (target && target.tagName === 'A') {
          const href = target.getAttribute('href') || '#';
          let tooltip = document.getElementById('accessibility-link-tooltip');
          if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'accessibility-link-tooltip';
            tooltip.style.position = 'fixed';
            tooltip.style.padding = '4px 8px';
            tooltip.style.backgroundColor = '#f43f5e';
            tooltip.style.color = 'white';
            tooltip.style.fontSize = '0.7rem';
            tooltip.style.fontWeight = 'bold';
            tooltip.style.borderRadius = '4px';
            tooltip.style.zIndex = '99999';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            document.body.appendChild(tooltip);
          }
          tooltip.innerText = `Target: ${href}`;
          let left = e.clientX + 10;
          if (left + 160 > window.innerWidth) {
            left = e.clientX - 170;
          }
          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${e.clientY - 25}px`;
          tooltip.style.display = 'block';
        }
      };
      const hideDest = () => {
        const tooltip = document.getElementById('accessibility-link-tooltip');
        if (tooltip) tooltip.style.display = 'none';
      };
      window.addEventListener('mousemove', showDest);
      window.addEventListener('mouseout', hideDest);
      return () => {
        window.removeEventListener('mousemove', showDest);
        window.removeEventListener('mouseout', hideDest);
        const tooltip = document.getElementById('accessibility-link-tooltip');
        if (tooltip) tooltip.remove();
      };
    }
  }, [linkDestinationDisplay]);

  // 7. TTS Hover Speech engine
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (textToSpeech) {
      let lastText = '';
      const speakHover = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target && target.innerText) {
          const txt = target.innerText.trim().substring(0, 150);
          if (txt && txt !== lastText) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(txt);
            utterance.rate = ttsSpeed === 'slow' ? 0.7 : ttsSpeed === 'fast' ? 1.4 : 1.0;
            utterance.pitch = ttsPitch === 'low' ? 0.7 : ttsPitch === 'high' ? 1.4 : 1.0;
            window.speechSynthesis.speak(utterance);
            lastText = txt;
          }
        }
      };
      window.addEventListener('mouseover', speakHover);
      return () => {
        window.removeEventListener('mouseover', speakHover);
        window.speechSynthesis.cancel();
      };
    } else {
      window.speechSynthesis.cancel();
    }
  }, [textToSpeech, ttsSpeed, ttsPitch]);

  // 8. Seizure & Animation Pauser (Freezes GIF images by replacing them with static canvas frames and pauses videos)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const shouldFreeze = seizureShield || pauseAnimations;
    if (!shouldFreeze) return;

    const freezeGifs = () => {
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        const src = img.src || '';
        if (src.includes('.gif') && !img.dataset.originalSrc) {
          img.dataset.originalSrc = src;
          const canvas = document.createElement('canvas');
          canvas.width = img.width || img.naturalWidth || 150;
          canvas.height = img.height || img.naturalHeight || 150;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            try {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              img.src = canvas.toDataURL();
            } catch (e) {
              // Ignore CORS
            }
          }
        }
      });
    };

    const pauseVideos = () => {
      document.querySelectorAll('video').forEach((v) => {
        try {
          if (!v.paused) v.pause();
        } catch (e) {
          // Ignore errors
        }
      });
    };

    const runFreeze = () => {
      freezeGifs();
      pauseVideos();
    };

    // Freeze existing GIFs and videos
    setTimeout(runFreeze, 150);

    const observer = new MutationObserver(runFreeze);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    const shieldStyle = document.createElement('style');
    shieldStyle.id = 'seizure-shield-style';
    shieldStyle.innerHTML = seizureShield
      ? `* { animation-duration: 99999s !important; transition-duration: 99999s !important; animation-name: none !important; } body { filter: brightness(85%) contrast(85%) !important; }`
      : `* { animation-duration: 0.001s !important; transition-duration: 0.001s !important; }`;
    document.head.appendChild(shieldStyle);

    return () => {
      observer.disconnect();
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        if (img.dataset.originalSrc) {
          img.src = img.dataset.originalSrc;
          delete img.dataset.originalSrc;
        }
      });
      shieldStyle.remove();
    };
  }, [seizureShield, pauseAnimations]);

  // 11. Mono Audio Mix Node Interceptor
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!audioMono) return;

    const OriginalAudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!OriginalAudioContext) return;

    const activeContexts: any[] = [];
    const PatchedAudioContext = function (this: any, ...args: any[]) {
      const context = new (OriginalAudioContext as any)(...args);
      try {
        context.destination.channelCount = 1;
        context.destination.channelCountMode = 'clamped-max';
      } catch (e) {
        // Safe check
      }
      activeContexts.push(context);
      return context;
    };
    PatchedAudioContext.prototype = OriginalAudioContext.prototype;
    (window as any).AudioContext = PatchedAudioContext;
    if ((window as any).webkitAudioContext) {
      (window as any).webkitAudioContext = PatchedAudioContext;
    }

    const handleMediaMono = (media: HTMLMediaElement) => {
      if (media.dataset.monoWrapped) return;
      media.dataset.monoWrapped = 'true';
      try {
        const url = new URL(media.src || '', window.location.href);
        if (url.origin === window.location.origin) {
          const ctx = new (PatchedAudioContext as any)();
          const source = ctx.createMediaElementSource(media);
          source.connect(ctx.destination);
        }
      } catch (e) {
        // Fallback for security/CORS errors
      }
    };

    const applyMono = () => {
      document.querySelectorAll('audio, video').forEach((el) => {
        handleMediaMono(el as HTMLMediaElement);
      });
    };

    applyMono();
    const observer = new MutationObserver(applyMono);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      (window as any).AudioContext = OriginalAudioContext;
      if ((window as any).webkitAudioContext) {
        (window as any).webkitAudioContext = OriginalAudioContext;
      }
    };
  }, [audioMono]);

  // 9. Keyboard Nav HUD overlay switcher
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let hud = document.getElementById('accessibility-hud-helper');
    if (keyboardNavHud) {
      if (!hud) {
        hud = document.createElement('div');
        hud.id = 'accessibility-hud-helper';
        hud.style.position = 'fixed';
        hud.style.bottom = '10px';
        hud.style.right = '10px';
        hud.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
        hud.style.border = '1px solid #3b82f6';
        hud.style.padding = '12px';
        hud.style.borderRadius = '8px';
        hud.style.zIndex = '99999';
        hud.style.color = '#f8fafc';
        hud.style.fontSize = '0.75rem';
        hud.innerHTML = `
          <div style="font-weight:bold;color:#3b82f6;margin-bottom:6px">Keyboard Shortcuts (Alt+)</div>
          <div>H - Home page</div>
          <div>A - Toggle navigation drawer</div>
          <div>R - Reset accessibility styles</div>
        `;
        document.body.appendChild(hud);
      }
    } else if (hud) {
      hud.remove();
    }
  }, [keyboardNavHud]);

  // 10. Keyboard Shortcuts keydown events listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (keyboardShortcuts) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.altKey) {
          const key = e.key.toLowerCase();
          if (key === 'h') {
            e.preventDefault();
            window.location.href = '/';
          } else if (key === 'r') {
            e.preventDefault();
            resetAll();
          } else if (key === 'a') {
            e.preventDefault();
            const trigger = document.querySelector('[aria-label="Toggle accessibility panel"]') as HTMLButtonElement;
            if (trigger) trigger.click();
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [keyboardShortcuts]);

  // Load from local storage
  useEffect(() => {
    const getStorage = (key: string, def: any) => {
      const val = localStorage.getItem(key);
      if (val === null) return def;
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    };

    setFontScaleState(getStorage('access-font-scale', 'normal') as FontScale);
    setLineHeightScaleState(getStorage('access-line-height-scale', 'normal') as LineHeightScale);
    setWordSpacingScaleState(getStorage('access-word-spacing-scale', 'normal') as WordSpacingScale);
    setTextAlignState(getStorage('access-text-align', 'none') as TextAlignOverride);
    setFontFamilyOverrideState(getStorage('access-font-family', 'none') as FontFamilyOverride);
    setColorBlindnessState(getStorage('access-color-blindness', 'none') as ColorBlindnessType);
    setHighContrastThemeState(getStorage('access-contrast-theme', 'none') as HighContrastTheme);
    setHighContrastState(getStorage('access-high-contrast', false));
    setDyslexiaFontState(getStorage('access-dyslexia-font', false));
    setGrayscaleModeState(getStorage('access-grayscale-mode', false));
    setUnderlineLinksState(getStorage('access-underline-links', false));
    setTextSpacingState(getStorage('access-text-spacing', false));
    setReduceMotionState(getStorage('access-reduce-motion', false));
    setLargeCursorState(getStorage('access-large-cursor', false));
    setReadingGuideState(getStorage('access-reading-guide', false));
    setInvertColorsState(getStorage('access-invert-colors', false));
    setTextToSpeechState(getStorage('access-text-speech', false));
    setScreenRulerState(getStorage('access-screen-ruler', false));
    setMagnifierModeState(getStorage('access-magnifier', false));
    setBigButtonModeState(getStorage('access-big-button', false));
    setKeyboardShortcutsState(getStorage('access-shortcuts', false));
    setReadingMaskState(getStorage('access-reading-mask', false));
    setAltTextOverlayState(getStorage('access-alt-text', false));
    setLinkDestinationDisplayState(getStorage('access-link-dest', false));
    setKeyboardNavHudState(getStorage('access-nav-hud', false));
    setRemoveTextShadowsState(getStorage('access-remove-shadows', false));
    setRemoveBackgroundsState(getStorage('access-remove-bg', false));
    setPauseAnimationsState(getStorage('access-pause-anim', false));
    setHighlightHeadersState(getStorage('access-highlight-headers', false));
    setStickyHeaderState(getStorage('access-sticky-header', false));
    setTtsSpeedState(getStorage('access-tts-speed', 'medium') as TtsSpeed);
    setTtsPitchState(getStorage('access-tts-pitch', 'medium') as TtsPitch);
    setAudioMonoState(getStorage('access-audio-mono', false));
    setSeizureShieldState(getStorage('access-seizure-shield', false));
  }, []);

  // Dynamic stylesheet injector to apply layout overrides directly on DOM tree elements
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let styleEl = document.getElementById('accessibility-dynamic-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'accessibility-dynamic-styles';
      document.head.appendChild(styleEl);
    }

    let cssRules = '';

    // 1. Font scaling on html element to scale rem values
    let htmlFontSize = '16px';
    if (fontScale === 'small') htmlFontSize = '13px';
    else if (fontScale === 'large') htmlFontSize = '19px';
    else if (fontScale === 'extra-large') htmlFontSize = '22px';
    cssRules += `html { font-size: ${htmlFontSize} !important; }\n`;

    // 2. Line height overrides
    if (lineHeightScale === 'large') {
      cssRules += `body, body *, p, span, a, button, input, h1, h2, h3, h4, h5, h6 { line-height: 1.85 !important; }\n`;
    } else if (lineHeightScale === 'extra-large') {
      cssRules += `body, body *, p, span, a, button, input, h1, h2, h3, h4, h5, h6 { line-height: 2.35 !important; }\n`;
    }

    // 3. Word Spacing and Letter Spacing overrides
    if (wordSpacingScale === 'large') {
      cssRules += `body, body *, p, span, a, button, input { word-spacing: 0.18em !important; letter-spacing: 0.08em !important; }\n`;
    } else if (wordSpacingScale === 'extra-large') {
      cssRules += `body, body *, p, span, a, button, input { word-spacing: 0.32em !important; letter-spacing: 0.14em !important; }\n`;
    }

    // 4. Text Alignment override
    if (textAlign !== 'none') {
      cssRules += `body, body *, p, span, div, h1, h2, h3, h4, h5, h6 { text-align: ${textAlign} !important; }\n`;
    }

    // 5. Font Face overrides
    if (fontFamilyOverride === 'serif') {
      cssRules += `body, body *, p, span, a, button, h1, h2, h3, h4, h5, h6, input, textarea { font-family: Georgia, Cambria, "Times New Roman", Times, serif !important; }\n`;
    } else if (fontFamilyOverride === 'sans-serif') {
      cssRules += `body, body *, p, span, a, button, h1, h2, h3, h4, h5, h6, input, textarea { font-family: Arial, Helvetica, sans-serif !important; }\n`;
    } else if (fontFamilyOverride === 'monospace') {
      cssRules += `body, body *, p, span, a, button, h1, h2, h3, h4, h5, h6, input, textarea { font-family: "Courier New", Courier, monospace !important; }\n`;
    } else if (fontFamilyOverride === 'dyslexic') {
      cssRules += `body, body *, p, span, a, button, h1, h2, h3, h4, h5, h6, input, textarea { font-family: "Comic Sans MS", "Chalkboard SE", "Arial", sans-serif !important; }\n`;
    }

    styleEl.innerHTML = cssRules;
  }, [fontScale, lineHeightScale, wordSpacingScale, textAlign, fontFamilyOverride]);

  // Update Body Class Hooks for toggles and filters
  useEffect(() => {
    const body = document.body;
    if (!body) return;

    const classPrefixes = ['cb-filter-', 'hc-theme-'];
    body.className.split(' ').forEach(cls => {
      if (classPrefixes.some(p => cls.startsWith(p))) {
        body.classList.remove(cls);
      }
    });

    if (colorBlindness !== 'none') body.classList.add(`cb-filter-${colorBlindness}`);
    if (highContrastTheme !== 'none') body.classList.add(`hc-theme-${highContrastTheme}`);

    body.classList.toggle('high-contrast-mode', highContrast);
    body.classList.toggle('open-dyslexic-font', dyslexiaFont);
    body.classList.toggle('underline-links-mode', underlineLinks);
    body.classList.toggle('text-spacing-mode', textSpacing);
    body.classList.toggle('reduce-motion-mode', reduceMotion || pauseAnimations);
    body.classList.toggle('large-cursor-mode', largeCursor);
    body.classList.toggle('big-button-mode', bigButtonMode);
    body.classList.toggle('remove-text-shadows', removeTextShadows);
    body.classList.toggle('remove-bg-patterns', removeBackgrounds);
    body.classList.toggle('highlight-headers-active', highlightHeaders);
    body.classList.toggle('sticky-header-active', stickyHeader);

    // Apply Filter Styles
    body.style.filter = grayscaleMode ? 'grayscale(100%)' : invertColors ? 'invert(100%)' : 'none';
  }, [
    colorBlindness, highContrastTheme, highContrast, dyslexiaFont, underlineLinks, textSpacing,
    reduceMotion, largeCursor, invertColors, bigButtonMode, removeTextShadows, removeBackgrounds,
    pauseAnimations, highlightHeaders, stickyHeader, grayscaleMode
  ]);

  const updateState = (setter: Function, key: string, val: any) => {
    setter(val);
    localStorage.setItem(key, String(val));
  };

  const resetAll = () => {
    updateState(setFontScaleState, 'access-font-scale', 'normal');
    updateState(setLineHeightScaleState, 'access-line-height-scale', 'normal');
    updateState(setWordSpacingScaleState, 'access-word-spacing-scale', 'normal');
    updateState(setTextAlignState, 'access-text-align', 'none');
    updateState(setFontFamilyOverrideState, 'access-font-family', 'none');
    updateState(setColorBlindnessState, 'access-color-blindness', 'none');
    updateState(setHighContrastThemeState, 'access-contrast-theme', 'none');
    updateState(setHighContrastState, 'access-high-contrast', false);
    updateState(setDyslexiaFontState, 'access-dyslexia-font', false);
    updateState(setGrayscaleModeState, 'access-grayscale-mode', false);
    updateState(setUnderlineLinksState, 'access-underline-links', false);
    updateState(setTextSpacingState, 'access-text-spacing', false);
    updateState(setReduceMotionState, 'access-reduce-motion', false);
    updateState(setLargeCursorState, 'access-large-cursor', false);
    updateState(setReadingGuideState, 'access-reading-guide', false);
    updateState(setInvertColorsState, 'access-invert-colors', false);
    updateState(setTextToSpeechState, 'access-text-speech', false);
    updateState(setScreenRulerState, 'access-screen-ruler', false);
    updateState(setMagnifierModeState, 'access-magnifier', false);
    updateState(setBigButtonModeState, 'access-big-button', false);
    updateState(setKeyboardShortcutsState, 'access-shortcuts', false);
    updateState(setReadingMaskState, 'access-reading-mask', false);
    updateState(setAltTextOverlayState, 'access-alt-text', false);
    updateState(setLinkDestinationDisplayState, 'access-link-dest', false);
    updateState(setKeyboardNavHudState, 'access-nav-hud', false);
    updateState(setRemoveTextShadowsState, 'access-remove-shadows', false);
    updateState(setRemoveBackgroundsState, 'access-remove-bg', false);
    updateState(setPauseAnimationsState, 'access-pause-anim', false);
    updateState(setHighlightHeadersState, 'access-highlight-headers', false);
    updateState(setStickyHeaderState, 'access-sticky-header', false);
    updateState(setTtsSpeedState, 'access-tts-speed', 'medium');
    updateState(setTtsPitchState, 'access-tts-pitch', 'medium');
    updateState(setAudioMonoState, 'access-audio-mono', false);
    updateState(setSeizureShieldState, 'access-seizure-shield', false);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale, setFontScale: (val) => updateState(setFontScaleState, 'access-font-scale', val),
        lineHeightScale, setLineHeightScale: (val) => updateState(setLineHeightScaleState, 'access-line-height-scale', val),
        wordSpacingScale, setWordSpacingScale: (val) => updateState(setWordSpacingScaleState, 'access-word-spacing-scale', val),
        textAlign, setTextAlign: (val) => updateState(setTextAlignState, 'access-text-align', val),
        fontFamilyOverride, setFontFamilyOverride: (val) => updateState(setFontFamilyOverrideState, 'access-font-family', val),
        colorBlindness, setColorBlindness: (val) => updateState(setColorBlindnessState, 'access-color-blindness', val),
        highContrastTheme, setHighContrastTheme: (val) => updateState(setHighContrastThemeState, 'access-contrast-theme', val),
        highContrast, setHighContrast: (val) => updateState(setHighContrastState, 'access-high-contrast', val),
        dyslexiaFont, setDyslexiaFont: (val) => updateState(setDyslexiaFontState, 'access-dyslexia-font', val),
        grayscaleMode, setGrayscaleMode: (val) => updateState(setGrayscaleModeState, 'access-grayscale-mode', val),
        underlineLinks, setUnderlineLinks: (val) => updateState(setUnderlineLinksState, 'access-underline-links', val),
        textSpacing, setTextSpacing: (val) => updateState(setTextSpacingState, 'access-text-spacing', val),
        reduceMotion, setReduceMotion: (val) => updateState(setReduceMotionState, 'access-reduce-motion', val),
        largeCursor, setLargeCursor: (val) => updateState(setLargeCursorState, 'access-large-cursor', val),
        readingGuide, setReadingGuide: (val) => updateState(setReadingGuideState, 'access-reading-guide', val),
        invertColors, setInvertColors: (val) => updateState(setInvertColorsState, 'access-invert-colors', val),
        textToSpeech, setTextToSpeech: (val) => updateState(setTextToSpeechState, 'access-text-speech', val),
        screenRuler, setScreenRuler: (val) => updateState(setScreenRulerState, 'access-screen-ruler', val),
        magnifierMode, setMagnifierMode: (val) => updateState(setMagnifierModeState, 'access-magnifier', val),
        bigButtonMode, setBigButtonMode: (val) => updateState(setBigButtonModeState, 'access-big-button', val),
        keyboardShortcuts, setKeyboardShortcuts: (val) => updateState(setKeyboardShortcutsState, 'access-shortcuts', val),
        readingMask, setReadingMask: (val) => updateState(setReadingMaskState, 'access-reading-mask', val),
        altTextOverlay, setAltTextOverlay: (val) => updateState(setAltTextOverlayState, 'access-alt-text', val),
        linkDestinationDisplay, setLinkDestinationDisplay: (val) => updateState(setLinkDestinationDisplayState, 'access-link-dest', val),
        keyboardNavHud, setKeyboardNavHud: (val) => updateState(setKeyboardNavHudState, 'access-nav-hud', val),
        removeTextShadows, setRemoveTextShadows: (val) => updateState(setRemoveTextShadowsState, 'access-remove-shadows', val),
        removeBackgrounds, setRemoveBackgrounds: (val) => updateState(setRemoveBackgroundsState, 'access-remove-bg', val),
        pauseAnimations, setPauseAnimations: (val) => updateState(setPauseAnimationsState, 'access-pause-anim', val),
        highlightHeaders, setHighlightHeaders: (val) => updateState(setHighlightHeadersState, 'access-highlight-headers', val),
        stickyHeader, setStickyHeader: (val) => updateState(setStickyHeaderState, 'access-sticky-header', val),
        ttsSpeed, setTtsSpeed: (val) => updateState(setTtsSpeedState, 'access-tts-speed', val),
        ttsPitch, setTtsPitch: (val) => updateState(setTtsPitchState, 'access-tts-pitch', val),
        audioMono, setAudioMono: (val) => updateState(setAudioMonoState, 'access-audio-mono', val),
        seizureShield, setSeizureShield: (val) => updateState(setSeizureShieldState, 'access-seizure-shield', val),
        resetAll,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
