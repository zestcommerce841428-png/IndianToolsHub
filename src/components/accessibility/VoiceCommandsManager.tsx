'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAccessibilityV2 } from '@/context/AccessibilityContextV2';

/**
 * VoiceCommandsManager - Web Speech Recognition API for voice control
 * Allows users to control accessibility features using voice commands
 * 
 * Supported Commands:
 * - "increase text size" / "decrease text size"
 * - "enable high contrast" / "disable high contrast"
 * - "enable dark mode" / "disable dark mode"
 * - "start reading" / "stop reading"
 * - "enable magnifier" / "disable magnifier"
 * - "scroll down" / "scroll up"
 * - "next heading" / "previous heading"
 * - "open accessibility menu"
 * - "reset settings"
 */

// TypeScript interfaces for Speech Recognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoiceCommandsManager() {
  const a11y = useAccessibilityV2();
  const [isMounted, setIsMounted] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  // BUG FIX #4: Track component mount state to prevent restart loop
  const isComponentMountedRef = useRef(true);
  const isFeatureEnabledRef = useRef(false);

  const navigateToNextHeading = useCallback(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    const nextHeading = headings.find(h => {
      const rect = h.getBoundingClientRect();
      return rect.top > 100;
    });

    if (nextHeading) {
      nextHeading.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (nextHeading as HTMLElement).focus();
    }
  }, []);

  const navigateToPreviousHeading = useCallback(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).reverse();
    
    const prevHeading = headings.find(h => {
      const rect = h.getBoundingClientRect();
      return rect.top < -100;
    });

    if (prevHeading) {
      prevHeading.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (prevHeading as HTMLElement).focus();
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const processVoiceCommand = useCallback((command: string) => {
    // Text size commands
    if (command.includes('increase text') || command.includes('larger text') || command.includes('bigger text')) {
      const sizes: Array<50 | 75 | 100 | 125 | 150 | 175 | 200> = [50, 75, 100, 125, 150, 175, 200];
      const currentIndex = sizes.indexOf(a11y.textSize);
      if (currentIndex < sizes.length - 1) {
        a11y.setTextSize(sizes[currentIndex + 1]);
        speak('Text size increased');
      }
      return;
    }

    if (command.includes('decrease text') || command.includes('smaller text')) {
      const sizes: Array<50 | 75 | 100 | 125 | 150 | 175 | 200> = [50, 75, 100, 125, 150, 175, 200];
      const currentIndex = sizes.indexOf(a11y.textSize);
      if (currentIndex > 0) {
        a11y.setTextSize(sizes[currentIndex - 1]);
        speak('Text size decreased');
      }
      return;
    }

    // Contrast commands
    if (command.includes('enable high contrast') || command.includes('turn on high contrast')) {
      a11y.setHighContrast(true);
      speak('High contrast enabled');
      return;
    }

    if (command.includes('disable high contrast') || command.includes('turn off high contrast')) {
      a11y.setHighContrast(false);
      speak('High contrast disabled');
      return;
    }

    // Dark mode commands
    if (command.includes('enable dark mode') || command.includes('turn on dark mode')) {
      a11y.setDarkMode(true);
      speak('Dark mode enabled');
      return;
    }

    if (command.includes('disable dark mode') || command.includes('turn off dark mode')) {
      a11y.setDarkMode(false);
      speak('Dark mode disabled');
      return;
    }

    // Text-to-speech commands
    if (command.includes('start reading') || command.includes('read page')) {
      a11y.setTextToSpeech(true);
      a11y.setAutoReadPage(true);
      speak('Starting to read page');
      return;
    }

    if (command.includes('stop reading')) {
      a11y.setTextToSpeech(false);
      a11y.setAutoReadPage(false);
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
      speak('Stopped reading');
      return;
    }

    // Magnifier commands
    if (command.includes('enable magnifier') || command.includes('turn on magnifier')) {
      a11y.setPageMagnifier(true);
      speak('Magnifier enabled');
      return;
    }

    if (command.includes('disable magnifier') || command.includes('turn off magnifier')) {
      a11y.setPageMagnifier(false);
      speak('Magnifier disabled');
      return;
    }

    // Scrolling commands
    if (command.includes('scroll down')) {
      if (typeof window !== 'undefined') window.scrollBy({ top: 300, behavior: 'smooth' });
      return;
    }

    if (command.includes('scroll up')) {
      if (typeof window !== 'undefined') window.scrollBy({ top: -300, behavior: 'smooth' });
      return;
    }

    // Navigation commands
    if (command.includes('next heading')) {
      navigateToNextHeading();
      speak('Next heading');
      return;
    }

    if (command.includes('previous heading')) {
      navigateToPreviousHeading();
      speak('Previous heading');
      return;
    }

    // Menu commands
    if (command.includes('open accessibility') || command.includes('accessibility menu')) {
      a11y.setPanelOpen(true);
      speak('Accessibility menu opened');
      return;
    }

    if (command.includes('close accessibility') || command.includes('close menu')) {
      a11y.setPanelOpen(false);
      speak('Menu closed');
      return;
    }

    // Reset command - reset to default values
    if (command.includes('reset settings') || command.includes('reset accessibility')) {
      a11y.setTextSize(100);
      a11y.setHighContrast(false);
      a11y.setDarkMode(false);
      a11y.setTextToSpeech(false);
      a11y.setPageMagnifier(false);
      speak('Settings reset to default');
      return;
    }

    // Reading guide commands
    if (command.includes('enable reading ruler') || command.includes('turn on ruler')) {
      a11y.setReadingRuler(true);
      speak('Reading ruler enabled');
      return;
    }

    if (command.includes('disable reading ruler') || command.includes('turn off ruler')) {
      a11y.setReadingRuler(false);
      speak('Reading ruler disabled');
      return;
    }

    // If no command matched
    console.log('[Voice Commands] Command not recognized:', command);
  }, [a11y, speak, navigateToNextHeading, navigateToPreviousHeading]);

  // Mount detection for SSR safety
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => {
      clearTimeout(timer);
      // BUG FIX #4: Mark component as unmounted
      isComponentMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // BUG FIX #4: Update feature enabled ref
    isFeatureEnabledRef.current = a11y.voiceCommands;
    
    if (!isMounted || !a11y.voiceCommands) {
      isFeatureEnabledRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      return;
    }

    // Check browser support
    const hasSupport = typeof window !== 'undefined' && 
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

    if (!hasSupport) {
      console.log('[Voice Commands] Speech recognition not supported in this browser');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('[Voice Commands] Listening started');
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log('[Voice Commands] Listening ended');
      setIsListening(false);
      
      // BUG FIX #4: Check component and feature state before restarting
      if (isComponentMountedRef.current && isFeatureEnabledRef.current) {
        setTimeout(() => {
          try {
            // Double-check still enabled before restart
            if (isFeatureEnabledRef.current) {
              recognition.start();
            }
          } catch (err) {
            console.error('[Voice Commands] Restart error:', err);
          }
        }, 1000);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[Voice Commands] Error:', event.error);
      if (event.error === 'no-speech') {
        // Ignore no-speech errors, just restart
        return;
      }
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.toLowerCase().trim();
      
      console.log('[Voice Commands] Heard:', command);
      setLastCommand(command);
      
      processVoiceCommand(command);
    };

    recognitionRef.current = recognition;

    // Start listening
    try {
      recognition.start();
    } catch (err) {
      console.error('[Voice Commands] Start error:', err);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isMounted, a11y.voiceCommands, processVoiceCommand]);

  // Don't render on server or if not mounted or not supported
  if (!isMounted || !a11y.voiceCommands) {
    return null;
  }

  const hasSupport = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  if (!hasSupport) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9997,
        background: isListening ? 'rgba(76, 175, 80, 0.9)' : 'rgba(158, 158, 158, 0.9)',
        color: 'white',
        padding: '10px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'white',
          animation: isListening ? 'pulse 1.5s infinite' : 'none',
        }}
      />
      {isListening ? 'Listening...' : 'Voice Commands Active'}
      {lastCommand && (
        <span style={{ fontSize: '11px', opacity: 0.8 }}>
          ({lastCommand.substring(0, 30)})
        </span>
      )}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
