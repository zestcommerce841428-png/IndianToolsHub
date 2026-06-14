'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AccessibilityState {
  // Text & Typography
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  paragraphSpacing: number;
  dyslexiaFont: boolean;
  readableFont: boolean;
  boldText: boolean;
  alignLeft: boolean;
  alignCenter: boolean;

  // Visual & Display
  highContrast: boolean;
  darkContrast: boolean;
  lightContrast: boolean;
  invertColors: boolean;
  monochrome: boolean;
  lowSaturation: boolean;
  highSaturation: boolean;
  sepia: boolean;
  blueLightFilter: boolean;

  // Color Vision
  protanopia: boolean;
  deuteranopia: boolean;
  tritanopia: boolean;

  // Content & Navigation
  highlightLinks: boolean;
  highlightHeadings: boolean;
  underlineLinks: boolean;
  hideImages: boolean;
  stopAnimations: boolean;
  muteMedia: boolean;
  pageStructure: boolean;

  // Cursor & Reading
  bigCursor: boolean;
  readingGuide: boolean;
  readingMask: boolean;
  textMagnifier: boolean;
  focusIndicator: boolean;
  keyboardNav: boolean;
  tooltipHelper: boolean;
  screenReader: boolean;

  // Spacing & Layout
  pageZoom: number;
  narrowContent: boolean;

  // Profiles
  seizureSafe: boolean;
  adhdFriendly: boolean;
  cognitiveProfile: boolean;
}

const defaultState: AccessibilityState = {
  fontSize: 0,
  lineHeight: 0,
  letterSpacing: 0,
  wordSpacing: 0,
  paragraphSpacing: 0,
  dyslexiaFont: false,
  readableFont: false,
  boldText: false,
  alignLeft: false,
  alignCenter: false,
  highContrast: false,
  darkContrast: false,
  lightContrast: false,
  invertColors: false,
  monochrome: false,
  lowSaturation: false,
  highSaturation: false,
  sepia: false,
  blueLightFilter: false,
  protanopia: false,
  deuteranopia: false,
  tritanopia: false,
  highlightLinks: false,
  highlightHeadings: false,
  underlineLinks: false,
  hideImages: false,
  stopAnimations: false,
  muteMedia: false,
  pageStructure: false,
  bigCursor: false,
  readingGuide: false,
  readingMask: false,
  textMagnifier: false,
  focusIndicator: false,
  keyboardNav: false,
  tooltipHelper: false,
  screenReader: false,
  pageZoom: 0,
  narrowContent: false,
  seizureSafe: false,
  adhdFriendly: false,
  cognitiveProfile: false,
};

interface AccessibilityContextType {
  state: AccessibilityState;
  updateState: (updates: Partial<AccessibilityState>) => void;
  resetAll: () => void;
  applyProfile: (profile: 'seizureSafe' | 'adhdFriendly' | 'cognitive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProviderV4({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-v4-state');
      if (saved) {
        try {
          return { ...defaultState, ...JSON.parse(saved) };
        } catch (e) {
          console.error('Failed to load accessibility state:', e);
        }
      }
    }
    return defaultState;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-v4-state', JSON.stringify(state));
    }
  }, [state]);

  const updateState = useCallback((updates: Partial<AccessibilityState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessibility-v4-state');
    }
  }, []);

  const applyProfile = useCallback((profile: 'seizureSafe' | 'adhdFriendly' | 'cognitive') => {
    let updates: Partial<AccessibilityState> = {};

    switch (profile) {
      case 'seizureSafe':
        updates = {
          stopAnimations: true,
          lowSaturation: true,
          blueLightFilter: true,
          muteMedia: true,
          seizureSafe: true,
        };
        break;
      case 'adhdFriendly':
        updates = {
          hideImages: true,
          stopAnimations: true,
          readingMask: true,
          focusIndicator: true,
          narrowContent: true,
          adhdFriendly: true,
        };
        break;
      case 'cognitive':
        updates = {
          readableFont: true,
          fontSize: 2,
          lineHeight: 2,
          paragraphSpacing: 2,
          highlightLinks: true,
          pageStructure: true,
          tooltipHelper: true,
          cognitiveProfile: true,
        };
        break;
    }

    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AccessibilityContext.Provider value={{ state, updateState, resetAll, applyProfile }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibilityV4() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityV4 must be used within AccessibilityProviderV4');
  }
  return context;
}
