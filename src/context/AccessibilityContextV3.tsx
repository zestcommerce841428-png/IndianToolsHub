'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Streamlined state - 47 practical features only
interface AccessibilityState {
  // Vision & Display (12)
  textSize: number;
  lineHeight: 'normal' | 'large' | 'xl';
  letterSpacing: 'normal' | 'wide' | 'xwide';
  fontFamily: 'default' | 'arial' | 'verdana' | 'dyslexic' | 'mono';
  highContrast: boolean;
  darkMode: boolean;
  invertColors: boolean;
  grayscale: boolean;
  brightness: number;
  saturation: number;
  focusIndicators: boolean;
  colorblindFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  
  // Reading & Content (10)
  readingRuler: boolean;
  readingMask: boolean;
  lineHighlighter: boolean;
  simplifyFonts: boolean;
  removeAnimations: boolean;
  pauseAutoplay: boolean;
  hideImages: boolean;
  removeBackgrounds: boolean;
  textAlignment: 'left' | 'center' | 'right' | 'justify';
  linkHighlighting: boolean;
  
  // Navigation & Control (8)
  largeCursor: boolean;
  cursorCrosshair: boolean;
  keyboardNavigation: boolean;
  tabOrderDisplay: boolean;
  skipLinksVisible: boolean;
  stickyHeader: boolean;
  scrollToTop: boolean;
  breadcrumbNav: boolean;
  
  // Audio & Speech (6)
  textToSpeech: boolean;
  speechRate: number;
  speechVoice: 'male' | 'female';
  autoReadHeadings: boolean;
  backgroundSoundMute: boolean;
  soundCaptions: boolean;
  
  // Layout & Structure (5)
  headingOutline: boolean;
  buttonHighlighting: boolean;
  whiteSpace: number;
  contentWidth: 'full' | 'contained' | 'narrow';
  responsiveTextFlow: boolean;
  
  // Motor & Interaction (6)
  bigButtonMode: boolean;
  touchTargetSize: boolean;
  clickDelay: number;
  disableDoubleClick: boolean;
  hoverFreeze: boolean;
  oneHandMode: boolean;
}

interface AccessibilityProfile {
  id: string;
  name: string;
  description: string;
  state: Partial<AccessibilityState>;
  isPreset: boolean;
}

interface AccessibilityContextValue extends AccessibilityState {
  // Setters for each feature
  setTextSize: (size: number) => void;
  setLineHeight: (height: AccessibilityState['lineHeight']) => void;
  setLetterSpacing: (spacing: AccessibilityState['letterSpacing']) => void;
  setFontFamily: (font: AccessibilityState['fontFamily']) => void;
  setHighContrast: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setInvertColors: (enabled: boolean) => void;
  setGrayscale: (enabled: boolean) => void;
  setBrightness: (value: number) => void;
  setSaturation: (value: number) => void;
  setFocusIndicators: (enabled: boolean) => void;
  setColorblindFilter: (filter: AccessibilityState['colorblindFilter']) => void;
  
  setReadingRuler: (enabled: boolean) => void;
  setReadingMask: (enabled: boolean) => void;
  setLineHighlighter: (enabled: boolean) => void;
  setSimplifyFonts: (enabled: boolean) => void;
  setRemoveAnimations: (enabled: boolean) => void;
  setPauseAutoplay: (enabled: boolean) => void;
  setHideImages: (enabled: boolean) => void;
  setRemoveBackgrounds: (enabled: boolean) => void;
  setTextAlignment: (alignment: AccessibilityState['textAlignment']) => void;
  setLinkHighlighting: (enabled: boolean) => void;
  
  setLargeCursor: (enabled: boolean) => void;
  setCursorCrosshair: (enabled: boolean) => void;
  setKeyboardNavigation: (enabled: boolean) => void;
  setTabOrderDisplay: (enabled: boolean) => void;
  setSkipLinksVisible: (enabled: boolean) => void;
  setStickyHeader: (enabled: boolean) => void;
  setScrollToTop: (enabled: boolean) => void;
  setBreadcrumbNav: (enabled: boolean) => void;
  
  setTextToSpeech: (enabled: boolean) => void;
  setSpeechRate: (rate: number) => void;
  setSpeechVoice: (voice: AccessibilityState['speechVoice']) => void;
  setAutoReadHeadings: (enabled: boolean) => void;
  setBackgroundSoundMute: (enabled: boolean) => void;
  setSoundCaptions: (enabled: boolean) => void;
  
  setHeadingOutline: (enabled: boolean) => void;
  setButtonHighlighting: (enabled: boolean) => void;
  setWhiteSpace: (value: number) => void;
  setContentWidth: (width: AccessibilityState['contentWidth']) => void;
  setResponsiveTextFlow: (enabled: boolean) => void;
  
  setBigButtonMode: (enabled: boolean) => void;
  setTouchTargetSize: (enabled: boolean) => void;
  setClickDelay: (delay: number) => void;
  setDisableDoubleClick: (enabled: boolean) => void;
  setHoverFreeze: (enabled: boolean) => void;
  setOneHandMode: (enabled: boolean) => void;
  
  // Profile management
  profiles: AccessibilityProfile[];
  loadProfile: (id: string) => void;
  saveProfile: (name: string, description: string) => void;
  deleteProfile: (id: string) => void;
  resetAll: () => void;
}

const defaultState: AccessibilityState = {
  // Vision
  textSize: 100,
  lineHeight: 'normal',
  letterSpacing: 'normal',
  fontFamily: 'default',
  highContrast: false,
  darkMode: false,
  invertColors: false,
  grayscale: false,
  brightness: 100,
  saturation: 100,
  focusIndicators: false,
  colorblindFilter: 'none',
  
  // Reading
  readingRuler: false,
  readingMask: false,
  lineHighlighter: false,
  simplifyFonts: false,
  removeAnimations: false,
  pauseAutoplay: false,
  hideImages: false,
  removeBackgrounds: false,
  textAlignment: 'left',
  linkHighlighting: false,
  
  // Navigation
  largeCursor: false,
  cursorCrosshair: false,
  keyboardNavigation: false,
  tabOrderDisplay: false,
  skipLinksVisible: false,
  stickyHeader: false,
  scrollToTop: false,
  breadcrumbNav: false,
  
  // Audio
  textToSpeech: false,
  speechRate: 1,
  speechVoice: 'female',
  autoReadHeadings: false,
  backgroundSoundMute: false,
  soundCaptions: false,
  
  // Layout
  headingOutline: false,
  buttonHighlighting: false,
  whiteSpace: 100,
  contentWidth: 'full',
  responsiveTextFlow: false,
  
  // Motor
  bigButtonMode: false,
  touchTargetSize: false,
  clickDelay: 0,
  disableDoubleClick: false,
  hoverFreeze: false,
  oneHandMode: false,
};

// Preset profiles for common needs
const presetProfiles: AccessibilityProfile[] = [
  {
    id: 'low-vision',
    name: 'Low Vision',
    description: 'Optimized for users with low vision',
    isPreset: true,
    state: {
      textSize: 150,
      lineHeight: 'xl',
      highContrast: true,
      focusIndicators: true,
      largeCursor: true,
    },
  },
  {
    id: 'motor-impairment',
    name: 'Motor Impairment',
    description: 'Larger targets and click assistance',
    isPreset: true,
    state: {
      bigButtonMode: true,
      touchTargetSize: true,
      clickDelay: 1,
      keyboardNavigation: true,
      focusIndicators: true,
    },
  },
  {
    id: 'cognitive',
    name: 'Cognitive Support',
    description: 'Simplified layout and reduced distractions',
    isPreset: true,
    state: {
      simplifyFonts: true,
      removeAnimations: true,
      removeBackgrounds: true,
      headingOutline: true,
      pauseAutoplay: true,
    },
  },
  {
    id: 'adhd',
    name: 'ADHD Focused',
    description: 'Reading aids and distraction reduction',
    isPreset: true,
    state: {
      readingRuler: true,
      removeAnimations: true,
      pauseAutoplay: true,
      hideImages: true,
      contentWidth: 'narrow',
    },
  },
];

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProviderV3({ children }: { children: ReactNode }) {
  // Lazy initialization: Load state from localStorage on first render
  const [state, setState] = useState<AccessibilityState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-v3-state');
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

  // Lazy initialization: Load custom profiles from localStorage
  const [profiles, setProfiles] = useState<AccessibilityProfile[]>(() => {
    if (typeof window !== 'undefined') {
      const savedProfiles = localStorage.getItem('accessibility-v3-profiles');
      if (savedProfiles) {
        try {
          const custom = JSON.parse(savedProfiles);
          return [...presetProfiles, ...custom];
        } catch (e) {
          console.error('Failed to load profiles:', e);
        }
      }
    }
    return presetProfiles;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-v3-state', JSON.stringify(state));
    }
  }, [state]);

  // Generic setter helper
  const createSetter = <K extends keyof AccessibilityState>(key: K) => {
    return (value: AccessibilityState[K]) => {
      setState(prev => ({ ...prev, [key]: value }));
    };
  };

  const loadProfile = (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (profile) {
      setState(prev => ({ ...prev, ...profile.state }));
    }
  };

  const saveProfile = (name: string, description: string) => {
    const newProfile: AccessibilityProfile = {
      id: `custom-${Date.now()}`,
      name,
      description,
      state,
      isPreset: false,
    };
    const customProfiles = profiles.filter(p => !p.isPreset);
    const updatedProfiles = [...presetProfiles, ...customProfiles, newProfile];
    setProfiles(updatedProfiles);
    localStorage.setItem(
      'accessibility-v3-profiles',
      JSON.stringify(customProfiles.concat(newProfile))
    );
  };

  const deleteProfile = (id: string) => {
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    const customOnly = updated.filter(p => !p.isPreset);
    localStorage.setItem('accessibility-v3-profiles', JSON.stringify(customOnly));
  };

  const resetAll = () => {
    setState(defaultState);
    localStorage.removeItem('accessibility-v3-state');
  };

  const value: AccessibilityContextValue = {
    ...state,
    
    // Vision setters
    setTextSize: createSetter('textSize'),
    setLineHeight: createSetter('lineHeight'),
    setLetterSpacing: createSetter('letterSpacing'),
    setFontFamily: createSetter('fontFamily'),
    setHighContrast: createSetter('highContrast'),
    setDarkMode: createSetter('darkMode'),
    setInvertColors: createSetter('invertColors'),
    setGrayscale: createSetter('grayscale'),
    setBrightness: createSetter('brightness'),
    setSaturation: createSetter('saturation'),
    setFocusIndicators: createSetter('focusIndicators'),
    setColorblindFilter: createSetter('colorblindFilter'),
    
    // Reading setters
    setReadingRuler: createSetter('readingRuler'),
    setReadingMask: createSetter('readingMask'),
    setLineHighlighter: createSetter('lineHighlighter'),
    setSimplifyFonts: createSetter('simplifyFonts'),
    setRemoveAnimations: createSetter('removeAnimations'),
    setPauseAutoplay: createSetter('pauseAutoplay'),
    setHideImages: createSetter('hideImages'),
    setRemoveBackgrounds: createSetter('removeBackgrounds'),
    setTextAlignment: createSetter('textAlignment'),
    setLinkHighlighting: createSetter('linkHighlighting'),
    
    // Navigation setters
    setLargeCursor: createSetter('largeCursor'),
    setCursorCrosshair: createSetter('cursorCrosshair'),
    setKeyboardNavigation: createSetter('keyboardNavigation'),
    setTabOrderDisplay: createSetter('tabOrderDisplay'),
    setSkipLinksVisible: createSetter('skipLinksVisible'),
    setStickyHeader: createSetter('stickyHeader'),
    setScrollToTop: createSetter('scrollToTop'),
    setBreadcrumbNav: createSetter('breadcrumbNav'),
    
    // Audio setters
    setTextToSpeech: createSetter('textToSpeech'),
    setSpeechRate: createSetter('speechRate'),
    setSpeechVoice: createSetter('speechVoice'),
    setAutoReadHeadings: createSetter('autoReadHeadings'),
    setBackgroundSoundMute: createSetter('backgroundSoundMute'),
    setSoundCaptions: createSetter('soundCaptions'),
    
    // Layout setters
    setHeadingOutline: createSetter('headingOutline'),
    setButtonHighlighting: createSetter('buttonHighlighting'),
    setWhiteSpace: createSetter('whiteSpace'),
    setContentWidth: createSetter('contentWidth'),
    setResponsiveTextFlow: createSetter('responsiveTextFlow'),
    
    // Motor setters
    setBigButtonMode: createSetter('bigButtonMode'),
    setTouchTargetSize: createSetter('touchTargetSize'),
    setClickDelay: createSetter('clickDelay'),
    setDisableDoubleClick: createSetter('disableDoubleClick'),
    setHoverFreeze: createSetter('hoverFreeze'),
    setOneHandMode: createSetter('oneHandMode'),
    
    // Profile management
    profiles,
    loadProfile,
    saveProfile,
    deleteProfile,
    resetAll,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibilityV3() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityV3 must be used within AccessibilityProviderV3');
  }
  return context;
}
