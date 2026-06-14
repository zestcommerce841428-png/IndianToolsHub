'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ==================== TYPE DEFINITIONS ====================

// Vision & Display (18 features)
export type TextSize = 50 | 75 | 100 | 125 | 150 | 175 | 200;
export type LineHeight = 'normal' | 'large' | 'xl' | 'max';
export type LetterSpacing = 'normal' | 'increased' | 'wide' | 'xwide';
export type WordSpacing = 'normal' | 'spaced' | 'wide' | 'xwide';
export type TextAlignment = 'default' | 'left' | 'center' | 'right' | 'justify';
export type FontFamily = 'default' | 'serif' | 'sans-serif' | 'monospace' | 'dyslexic' | 'arial' | 'verdana';

export type ContrastTheme = 
  | 'none'
  | 'yellow-on-black'
  | 'white-on-black'
  | 'black-on-white'
  | 'black-on-yellow'
  | 'green-on-black'
  | 'blue-on-white'
  | 'amber-on-dark'
  | 'custom';

export type ColorblindFilter = 
  | 'none'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia'
  | 'blue-cone';

// Reading & Focus (15 features)
export type ReadingGuideType = 'none' | 'line' | 'ruler' | 'mask' | 'spotlight';
export type SpeechRate = 0.5 | 1 | 1.5 | 2;
export type SpeechVoice = 'male' | 'female';
export type SpeechPitch = 'low' | 'normal' | 'high';

// Navigation & Control (16 features)
export type CursorSize = 1 | 2 | 3 | 4;
export type CursorColor = 'default' | 'red' | 'blue' | 'green' | 'yellow' | 'pink';

// Motor & Dexterity (8 features)
export type ButtonSize = 1 | 1.5 | 2 | 3;
export type ClickDelay = 0 | 0.5 | 1 | 1.5 | 2;

// Time Format
export type TimeFormat = '12h' | '24h';

// Profile
export interface AccessibilityProfile {
  id: string;
  name: string;
  description: string;
  settings: Partial<AccessibilityState>;
  createdAt: string;
  isPreset?: boolean;
}

// Main State Interface (101 features)
export interface AccessibilityState {
  // === VISION & DISPLAY (18) ===
  // Text Adjustments (6)
  textSize: TextSize;
  lineHeight: LineHeight;
  letterSpacing: LetterSpacing;
  wordSpacing: WordSpacing;
  textAlignment: TextAlignment;
  fontFamily: FontFamily;
  
  // Color & Contrast (12)
  highContrast: boolean;
  contrastTheme: ContrastTheme;
  invertColors: boolean;
  grayscaleMode: boolean;
  darkMode: boolean;
  lightMode: boolean;
  sepiaTone: boolean;
  colorblindFilter: ColorblindFilter;
  brightness: number; // 50-150
  saturation: number; // 0-200
  hueRotation: number; // 0-360
  customTextColor: string;
  customBackgroundColor: string;
  
  // === READING & FOCUS (15) ===
  // Reading Guides (8)
  readingGuide: ReadingGuideType;
  readingRuler: boolean;
  readingMask: boolean;
  readingSpotlight: boolean;
  lineHighlighter: boolean;
  paragraphHighlighter: boolean;
  autoScroll: boolean;
  autoScrollSpeed: number; // 1-10
  dyslexiaRuler: boolean;
  
  // Text Enhancements (7)
  textToSpeech: boolean;
  speechRate: SpeechRate;
  speechVoice: SpeechVoice;
  speechPitch: SpeechPitch;
  autoReadPage: boolean;
  wordHighlighting: boolean;
  sentenceHighlighting: boolean;
  
  // === NAVIGATION & CONTROL (16) ===
  // Mouse & Cursor (6)
  largeCursor: boolean;
  cursorSize: CursorSize;
  cursorColor: CursorColor;
  cursorTrail: boolean;
  cursorCrosshair: boolean;
  clickAnimation: boolean;
  virtualMouse: boolean;
  
  // Keyboard (10)
  keyboardNavigation: boolean;
  keyboardShortcuts: boolean;
  focusIndicators: boolean;
  skipToContent: boolean;
  focusMode: boolean;
  tabOrderDisplay: boolean;
  accessKeysDisplay: boolean;
  keyboardNavHUD: boolean;
  stickyKeys: boolean;
  slowKeys: boolean;
  slowKeysDelay: number; // milliseconds
  
  // === CONTENT ENHANCEMENT (12) ===
  linkUnderlining: boolean;
  linkIcons: boolean;
  linkTooltips: boolean;
  altTextOverlay: boolean;
  imageDescriptions: boolean;
  hideImages: boolean;
  simplifyFonts: boolean;
  removeAnimations: boolean;
  pauseGifs: boolean;
  removeVideos: boolean;
  removeBackgrounds: boolean;
  removeShadows: boolean;
  
  // === LAYOUT & STRUCTURE (10) ===
  pageStructureView: boolean;
  headingNavigation: boolean;
  landmarkNavigation: boolean;
  listNavigation: boolean;
  tableNavigation: boolean;
  formNavigation: boolean;
  stickyHeader: boolean;
  highlightHeaders: boolean;
  highlightButtons: boolean;
  whiteSpaceControl: number; // 0-200 (percentage)
  
  // === MOTOR & DEXTERITY (8) ===
  bigButtonMode: boolean;
  buttonSize: ButtonSize;
  clickDelay: ClickDelay;
  doubleClickDisable: boolean;
  dragDropDisable: boolean;
  touchTargetSize: boolean;
  hoverFreeze: boolean;
  autoComplete: boolean;
  voiceCommands: boolean;
  
  // === COGNITIVE & LEARNING (7) ===
  simplifiedLanguage: boolean;
  readingLevel: boolean;
  definitionTooltips: boolean;
  numberFormatting: boolean;
  timeFormat: TimeFormat;
  timezoneDisplay: boolean;
  contentSummary: boolean;
  
  // === SEIZURE & VESTIBULAR (6) ===
  seizureSafeMode: boolean;
  animationFreeze: boolean;
  parallaxDisable: boolean;
  reduceMotion: boolean;
  staticImagesOnly: boolean;
  flashingWarning: boolean;
  
  // === AUDIO & SOUND (5) ===
  monoAudio: boolean;
  volumeControl: number; // 0-100
  backgroundSoundMute: boolean;
  soundCaptions: boolean;
  audioDescriptions: boolean;
  
  // === ADVANCED TOOLS (3) ===
  pageMagnifier: boolean;
  magnifierZoom: number; // 2-10
  virtualMagnifier: boolean;
  screenReaderMode: boolean;
  pdfMode: boolean;
  
  // === SYSTEM ===
  profiles: AccessibilityProfile[];
  activeProfile: string | null;
  widgetPosition: { x: number; y: number };
  panelOpen: boolean;
}

// Context Type
interface AccessibilityContextType extends AccessibilityState {
  // Setters for all features
  setTextSize: (size: TextSize) => void;
  setLineHeight: (height: LineHeight) => void;
  setLetterSpacing: (spacing: LetterSpacing) => void;
  setWordSpacing: (spacing: WordSpacing) => void;
  setTextAlignment: (align: TextAlignment) => void;
  setFontFamily: (font: FontFamily) => void;
  
  setHighContrast: (enabled: boolean) => void;
  setContrastTheme: (theme: ContrastTheme) => void;
  setInvertColors: (enabled: boolean) => void;
  setGrayscaleMode: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setLightMode: (enabled: boolean) => void;
  setSepiaTone: (enabled: boolean) => void;
  setColorblindFilter: (filter: ColorblindFilter) => void;
  setBrightness: (value: number) => void;
  setSaturation: (value: number) => void;
  setHueRotation: (value: number) => void;
  setCustomTextColor: (color: string) => void;
  setCustomBackgroundColor: (color: string) => void;
  
  setReadingGuide: (type: ReadingGuideType) => void;
  setReadingRuler: (enabled: boolean) => void;
  setReadingMask: (enabled: boolean) => void;
  setReadingSpotlight: (enabled: boolean) => void;
  setLineHighlighter: (enabled: boolean) => void;
  setParagraphHighlighter: (enabled: boolean) => void;
  setAutoScroll: (enabled: boolean) => void;
  setAutoScrollSpeed: (speed: number) => void;
  setDyslexiaRuler: (enabled: boolean) => void;
  
  setTextToSpeech: (enabled: boolean) => void;
  setSpeechRate: (rate: SpeechRate) => void;
  setSpeechVoice: (voice: SpeechVoice) => void;
  setSpeechPitch: (pitch: SpeechPitch) => void;
  setAutoReadPage: (enabled: boolean) => void;
  setWordHighlighting: (enabled: boolean) => void;
  setSentenceHighlighting: (enabled: boolean) => void;
  
  setLargeCursor: (enabled: boolean) => void;
  setCursorSize: (size: CursorSize) => void;
  setCursorColor: (color: CursorColor) => void;
  setCursorTrail: (enabled: boolean) => void;
  setCursorCrosshair: (enabled: boolean) => void;
  setClickAnimation: (enabled: boolean) => void;
  setVirtualMouse: (enabled: boolean) => void;
  
  setKeyboardNavigation: (enabled: boolean) => void;
  setKeyboardShortcuts: (enabled: boolean) => void;
  setFocusIndicators: (enabled: boolean) => void;
  setSkipToContent: (enabled: boolean) => void;
  setFocusMode: (enabled: boolean) => void;
  setTabOrderDisplay: (enabled: boolean) => void;
  setAccessKeysDisplay: (enabled: boolean) => void;
  setKeyboardNavHUD: (enabled: boolean) => void;
  setStickyKeys: (enabled: boolean) => void;
  setSlowKeys: (enabled: boolean) => void;
  setSlowKeysDelay: (delay: number) => void;
  
  setLinkUnderlining: (enabled: boolean) => void;
  setLinkIcons: (enabled: boolean) => void;
  setLinkTooltips: (enabled: boolean) => void;
  setAltTextOverlay: (enabled: boolean) => void;
  setImageDescriptions: (enabled: boolean) => void;
  setHideImages: (enabled: boolean) => void;
  setSimplifyFonts: (enabled: boolean) => void;
  setRemoveAnimations: (enabled: boolean) => void;
  setPauseGifs: (enabled: boolean) => void;
  setRemoveVideos: (enabled: boolean) => void;
  setRemoveBackgrounds: (enabled: boolean) => void;
  setRemoveShadows: (enabled: boolean) => void;
  
  setPageStructureView: (enabled: boolean) => void;
  setHeadingNavigation: (enabled: boolean) => void;
  setLandmarkNavigation: (enabled: boolean) => void;
  setListNavigation: (enabled: boolean) => void;
  setTableNavigation: (enabled: boolean) => void;
  setFormNavigation: (enabled: boolean) => void;
  setStickyHeader: (enabled: boolean) => void;
  setHighlightHeaders: (enabled: boolean) => void;
  setHighlightButtons: (enabled: boolean) => void;
  setWhiteSpaceControl: (value: number) => void;
  
  setBigButtonMode: (enabled: boolean) => void;
  setButtonSize: (size: ButtonSize) => void;
  setClickDelay: (delay: ClickDelay) => void;
  setDoubleClickDisable: (enabled: boolean) => void;
  setDragDropDisable: (enabled: boolean) => void;
  setTouchTargetSize: (enabled: boolean) => void;
  setHoverFreeze: (enabled: boolean) => void;
  setAutoComplete: (enabled: boolean) => void;
  setVoiceCommands: (enabled: boolean) => void;
  
  setSimplifiedLanguage: (enabled: boolean) => void;
  setReadingLevel: (enabled: boolean) => void;
  setDefinitionTooltips: (enabled: boolean) => void;
  setNumberFormatting: (enabled: boolean) => void;
  setTimeFormat: (format: TimeFormat) => void;
  setTimezoneDisplay: (enabled: boolean) => void;
  setContentSummary: (enabled: boolean) => void;
  
  setSeizureSafeMode: (enabled: boolean) => void;
  setAnimationFreeze: (enabled: boolean) => void;
  setParallaxDisable: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setStaticImagesOnly: (enabled: boolean) => void;
  setFlashingWarning: (enabled: boolean) => void;
  
  setMonoAudio: (enabled: boolean) => void;
  setVolumeControl: (value: number) => void;
  setBackgroundSoundMute: (enabled: boolean) => void;
  setSoundCaptions: (enabled: boolean) => void;
  setAudioDescriptions: (enabled: boolean) => void;
  
  setPageMagnifier: (enabled: boolean) => void;
  setMagnifierZoom: (zoom: number) => void;
  setVirtualMagnifier: (enabled: boolean) => void;
  setScreenReaderMode: (enabled: boolean) => void;
  setPdfMode: (enabled: boolean) => void;
  
  setPanelOpen: (open: boolean) => void;
  setWidgetPosition: (position: { x: number; y: number }) => void;
  
  // Profile management
  saveProfile: (name: string, description: string) => void;
  loadProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  
  // Utility
  resetAll: () => void;
  resetCategory: (category: string) => void;
}

// ==================== DEFAULT STATE ====================

const defaultState: AccessibilityState = {
  // Vision & Display
  textSize: 100,
  lineHeight: 'normal',
  letterSpacing: 'normal',
  wordSpacing: 'normal',
  textAlignment: 'default',
  fontFamily: 'default',
  highContrast: false,
  contrastTheme: 'none',
  invertColors: false,
  grayscaleMode: false,
  darkMode: false,
  lightMode: false,
  sepiaTone: false,
  colorblindFilter: 'none',
  brightness: 100,
  saturation: 100,
  hueRotation: 0,
  customTextColor: '#000000',
  customBackgroundColor: '#ffffff',
  
  // Reading & Focus
  readingGuide: 'none',
  readingRuler: false,
  readingMask: false,
  readingSpotlight: false,
  lineHighlighter: false,
  paragraphHighlighter: false,
  autoScroll: false,
  autoScrollSpeed: 5,
  dyslexiaRuler: false,
  textToSpeech: false,
  speechRate: 1,
  speechVoice: 'female',
  speechPitch: 'normal',
  autoReadPage: false,
  wordHighlighting: false,
  sentenceHighlighting: false,
  
  // Navigation & Control
  largeCursor: false,
  cursorSize: 1,
  cursorColor: 'default',
  cursorTrail: false,
  cursorCrosshair: false,
  clickAnimation: false,
  virtualMouse: false,
  keyboardNavigation: true,
  keyboardShortcuts: true,
  focusIndicators: true,
  skipToContent: false,
  focusMode: false,
  tabOrderDisplay: false,
  accessKeysDisplay: false,
  keyboardNavHUD: false,
  stickyKeys: false,
  slowKeys: false,
  slowKeysDelay: 500,
  
  // Content Enhancement
  linkUnderlining: false,
  linkIcons: false,
  linkTooltips: false,
  altTextOverlay: false,
  imageDescriptions: false,
  hideImages: false,
  simplifyFonts: false,
  removeAnimations: false,
  pauseGifs: false,
  removeVideos: false,
  removeBackgrounds: false,
  removeShadows: false,
  
  // Layout & Structure
  pageStructureView: false,
  headingNavigation: false,
  landmarkNavigation: false,
  listNavigation: false,
  tableNavigation: false,
  formNavigation: false,
  stickyHeader: false,
  highlightHeaders: false,
  highlightButtons: false,
  whiteSpaceControl: 100,
  
  // Motor & Dexterity
  bigButtonMode: false,
  buttonSize: 1,
  clickDelay: 0,
  doubleClickDisable: false,
  dragDropDisable: false,
  touchTargetSize: false,
  hoverFreeze: false,
  autoComplete: false,
  voiceCommands: false,
  
  // Cognitive & Learning
  simplifiedLanguage: false,
  readingLevel: false,
  definitionTooltips: false,
  numberFormatting: false,
  timeFormat: '12h',
  timezoneDisplay: false,
  contentSummary: false,
  
  // Seizure & Vestibular
  seizureSafeMode: false,
  animationFreeze: false,
  parallaxDisable: false,
  reduceMotion: false,
  staticImagesOnly: false,
  flashingWarning: false,
  
  // Audio & Sound
  monoAudio: false,
  volumeControl: 100,
  backgroundSoundMute: false,
  soundCaptions: false,
  audioDescriptions: false,
  
  // Advanced Tools
  pageMagnifier: false,
  magnifierZoom: 2,
  virtualMagnifier: false,
  screenReaderMode: false,
  pdfMode: false,
  
  // System
  profiles: [],
  activeProfile: null,
  widgetPosition: { x: 20, y: 500 }, // Safe default for SSR, will update on client
  panelOpen: false,
};

// ==================== PRESET PROFILES ====================

const presetProfiles: AccessibilityProfile[] = [
  {
    id: 'visual-impairment',
    name: 'Visual Impairment',
    description: 'Larger text, high contrast, screen reader optimized',
    isPreset: true,
    createdAt: new Date().toISOString(),
    settings: {
      textSize: 150,
      lineHeight: 'large',
      letterSpacing: 'increased',
      highContrast: true,
      contrastTheme: 'yellow-on-black',
      focusIndicators: true,
      screenReaderMode: true,
      linkUnderlining: true,
    },
  },
  {
    id: 'motor-difficulty',
    name: 'Motor Difficulty',
    description: 'Larger buttons, click delays, keyboard navigation',
    isPreset: true,
    createdAt: new Date().toISOString(),
    settings: {
      bigButtonMode: true,
      buttonSize: 2,
      clickDelay: 1,
      touchTargetSize: true,
      keyboardNavigation: true,
      focusIndicators: true,
      doubleClickDisable: true,
      slowKeys: true,
    },
  },
  {
    id: 'dyslexia',
    name: 'Dyslexia Friendly',
    description: 'Dyslexia font, increased spacing, reading guides',
    isPreset: true,
    createdAt: new Date().toISOString(),
    settings: {
      fontFamily: 'dyslexic',
      textSize: 125,
      lineHeight: 'large',
      letterSpacing: 'increased',
      wordSpacing: 'spaced',
      readingRuler: true,
      dyslexiaRuler: true,
      lineHighlighter: true,
    },
  },
  {
    id: 'adhd-focus',
    name: 'ADHD Focus Mode',
    description: 'Reading mask, reduced distractions, simplified content',
    isPreset: true,
    createdAt: new Date().toISOString(),
    settings: {
      readingMask: true,
      removeAnimations: true,
      pauseGifs: true,
      simplifyFonts: true,
      focusMode: true,
      removeBackgrounds: true,
      hideImages: false,
    },
  },
  {
    id: 'seizure-safe',
    name: 'Seizure Safe',
    description: 'No flashing, animations frozen, static content',
    isPreset: true,
    createdAt: new Date().toISOString(),
    settings: {
      seizureSafeMode: true,
      animationFreeze: true,
      removeAnimations: true,
      pauseGifs: true,
      staticImagesOnly: true,
      flashingWarning: true,
      reduceMotion: true,
    },
  },
  {
    id: 'colorblind',
    name: 'Colorblind Assistance',
    description: 'Colorblind filters and enhanced contrast',
    isPreset: true,
    createdAt: new Date().toISOString(),
    settings: {
      colorblindFilter: 'deuteranopia',
      highContrast: true,
      linkUnderlining: true,
      linkIcons: true,
      highlightButtons: true,
    },
  },
];

// ==================== CONTEXT ====================

const AccessibilityContextV2 = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProviderV2: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AccessibilityState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-v2-state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...defaultState,
            ...parsed,
            profiles: [...presetProfiles, ...(parsed.profiles || [])],
          };
        } catch (e) {
          console.error('Failed to parse accessibility state:', e);
        }
      }
    }
    return { ...defaultState, profiles: presetProfiles };
  });

  // Persist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { profiles, ...stateToSave } = state;
      const userProfiles = profiles.filter(p => !p.isPreset);
      localStorage.setItem('accessibility-v2-state', JSON.stringify({
        ...stateToSave,
        profiles: userProfiles,
      }));
    }
  }, [state]);

  // Generic setter
  const updateState = <K extends keyof AccessibilityState>(
    key: K,
    value: AccessibilityState[K]
  ) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  // Profile management
  const saveProfile = (name: string, description: string) => {
    const newProfile: AccessibilityProfile = {
      id: `profile-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      settings: { ...state },
    };
    setState(prev => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
    }));
  };

  const loadProfile = (profileId: string) => {
    const profile = state.profiles.find(p => p.id === profileId);
    if (profile) {
      setState(prev => ({
        ...prev,
        ...profile.settings,
        activeProfile: profileId,
      }));
    }
  };

  const deleteProfile = (profileId: string) => {
    setState(prev => ({
      ...prev,
      profiles: prev.profiles.filter(p => p.id !== profileId && !p.isPreset),
      activeProfile: prev.activeProfile === profileId ? null : prev.activeProfile,
    }));
  };

  const resetAll = () => {
    setState({ ...defaultState, profiles: state.profiles });
  };

  const resetCategory = (category: string) => {
    // Reset specific category features
    // Implementation based on category
    console.log(`Resetting category: ${category}`);
  };

  const contextValue: AccessibilityContextType = {
    ...state,
    
    // Vision & Display setters
    setTextSize: (size) => updateState('textSize', size),
    setLineHeight: (height) => updateState('lineHeight', height),
    setLetterSpacing: (spacing) => updateState('letterSpacing', spacing),
    setWordSpacing: (spacing) => updateState('wordSpacing', spacing),
    setTextAlignment: (align) => updateState('textAlignment', align),
    setFontFamily: (font) => updateState('fontFamily', font),
    setHighContrast: (enabled) => updateState('highContrast', enabled),
    setContrastTheme: (theme) => updateState('contrastTheme', theme),
    setInvertColors: (enabled) => updateState('invertColors', enabled),
    setGrayscaleMode: (enabled) => updateState('grayscaleMode', enabled),
    setDarkMode: (enabled) => updateState('darkMode', enabled),
    setLightMode: (enabled) => updateState('lightMode', enabled),
    setSepiaTone: (enabled) => updateState('sepiaTone', enabled),
    setColorblindFilter: (filter) => updateState('colorblindFilter', filter),
    setBrightness: (value) => updateState('brightness', value),
    setSaturation: (value) => updateState('saturation', value),
    setHueRotation: (value) => updateState('hueRotation', value),
    setCustomTextColor: (color) => updateState('customTextColor', color),
    setCustomBackgroundColor: (color) => updateState('customBackgroundColor', color),
    
    // Reading & Focus setters
    setReadingGuide: (type) => updateState('readingGuide', type),
    setReadingRuler: (enabled) => updateState('readingRuler', enabled),
    setReadingMask: (enabled) => updateState('readingMask', enabled),
    setReadingSpotlight: (enabled) => updateState('readingSpotlight', enabled),
    setLineHighlighter: (enabled) => updateState('lineHighlighter', enabled),
    setParagraphHighlighter: (enabled) => updateState('paragraphHighlighter', enabled),
    setAutoScroll: (enabled) => updateState('autoScroll', enabled),
    setAutoScrollSpeed: (speed) => updateState('autoScrollSpeed', speed),
    setDyslexiaRuler: (enabled) => updateState('dyslexiaRuler', enabled),
    setTextToSpeech: (enabled) => updateState('textToSpeech', enabled),
    setSpeechRate: (rate) => updateState('speechRate', rate),
    setSpeechVoice: (voice) => updateState('speechVoice', voice),
    setSpeechPitch: (pitch) => updateState('speechPitch', pitch),
    setAutoReadPage: (enabled) => updateState('autoReadPage', enabled),
    setWordHighlighting: (enabled) => updateState('wordHighlighting', enabled),
    setSentenceHighlighting: (enabled) => updateState('sentenceHighlighting', enabled),
    
    // Navigation & Control setters
    setLargeCursor: (enabled) => updateState('largeCursor', enabled),
    setCursorSize: (size) => updateState('cursorSize', size),
    setCursorColor: (color) => updateState('cursorColor', color),
    setCursorTrail: (enabled) => updateState('cursorTrail', enabled),
    setCursorCrosshair: (enabled) => updateState('cursorCrosshair', enabled),
    setClickAnimation: (enabled) => updateState('clickAnimation', enabled),
    setVirtualMouse: (enabled) => updateState('virtualMouse', enabled),
    setKeyboardNavigation: (enabled) => updateState('keyboardNavigation', enabled),
    setKeyboardShortcuts: (enabled) => updateState('keyboardShortcuts', enabled),
    setFocusIndicators: (enabled) => updateState('focusIndicators', enabled),
    setSkipToContent: (enabled) => updateState('skipToContent', enabled),
    setFocusMode: (enabled) => updateState('focusMode', enabled),
    setTabOrderDisplay: (enabled) => updateState('tabOrderDisplay', enabled),
    setAccessKeysDisplay: (enabled) => updateState('accessKeysDisplay', enabled),
    setKeyboardNavHUD: (enabled) => updateState('keyboardNavHUD', enabled),
    setStickyKeys: (enabled) => updateState('stickyKeys', enabled),
    setSlowKeys: (enabled) => updateState('slowKeys', enabled),
    setSlowKeysDelay: (delay) => updateState('slowKeysDelay', delay),
    
    // Content Enhancement setters
    setLinkUnderlining: (enabled) => updateState('linkUnderlining', enabled),
    setLinkIcons: (enabled) => updateState('linkIcons', enabled),
    setLinkTooltips: (enabled) => updateState('linkTooltips', enabled),
    setAltTextOverlay: (enabled) => updateState('altTextOverlay', enabled),
    setImageDescriptions: (enabled) => updateState('imageDescriptions', enabled),
    setHideImages: (enabled) => updateState('hideImages', enabled),
    setSimplifyFonts: (enabled) => updateState('simplifyFonts', enabled),
    setRemoveAnimations: (enabled) => updateState('removeAnimations', enabled),
    setPauseGifs: (enabled) => updateState('pauseGifs', enabled),
    setRemoveVideos: (enabled) => updateState('removeVideos', enabled),
    setRemoveBackgrounds: (enabled) => updateState('removeBackgrounds', enabled),
    setRemoveShadows: (enabled) => updateState('removeShadows', enabled),
    
    // Layout & Structure setters
    setPageStructureView: (enabled) => updateState('pageStructureView', enabled),
    setHeadingNavigation: (enabled) => updateState('headingNavigation', enabled),
    setLandmarkNavigation: (enabled) => updateState('landmarkNavigation', enabled),
    setListNavigation: (enabled) => updateState('listNavigation', enabled),
    setTableNavigation: (enabled) => updateState('tableNavigation', enabled),
    setFormNavigation: (enabled) => updateState('formNavigation', enabled),
    setStickyHeader: (enabled) => updateState('stickyHeader', enabled),
    setHighlightHeaders: (enabled) => updateState('highlightHeaders', enabled),
    setHighlightButtons: (enabled) => updateState('highlightButtons', enabled),
    setWhiteSpaceControl: (value) => updateState('whiteSpaceControl', value),
    
    // Motor & Dexterity setters
    setBigButtonMode: (enabled) => updateState('bigButtonMode', enabled),
    setButtonSize: (size) => updateState('buttonSize', size),
    setClickDelay: (delay) => updateState('clickDelay', delay),
    setDoubleClickDisable: (enabled) => updateState('doubleClickDisable', enabled),
    setDragDropDisable: (enabled) => updateState('dragDropDisable', enabled),
    setTouchTargetSize: (enabled) => updateState('touchTargetSize', enabled),
    setHoverFreeze: (enabled) => updateState('hoverFreeze', enabled),
    setAutoComplete: (enabled) => updateState('autoComplete', enabled),
    setVoiceCommands: (enabled) => updateState('voiceCommands', enabled),
    
    // Cognitive & Learning setters
    setSimplifiedLanguage: (enabled) => updateState('simplifiedLanguage', enabled),
    setReadingLevel: (enabled) => updateState('readingLevel', enabled),
    setDefinitionTooltips: (enabled) => updateState('definitionTooltips', enabled),
    setNumberFormatting: (enabled) => updateState('numberFormatting', enabled),
    setTimeFormat: (format) => updateState('timeFormat', format),
    setTimezoneDisplay: (enabled) => updateState('timezoneDisplay', enabled),
    setContentSummary: (enabled) => updateState('contentSummary', enabled),
    
    // Seizure & Vestibular setters
    setSeizureSafeMode: (enabled) => updateState('seizureSafeMode', enabled),
    setAnimationFreeze: (enabled) => updateState('animationFreeze', enabled),
    setParallaxDisable: (enabled) => updateState('parallaxDisable', enabled),
    setReduceMotion: (enabled) => updateState('reduceMotion', enabled),
    setStaticImagesOnly: (enabled) => updateState('staticImagesOnly', enabled),
    setFlashingWarning: (enabled) => updateState('flashingWarning', enabled),
    
    // Audio & Sound setters
    setMonoAudio: (enabled) => updateState('monoAudio', enabled),
    setVolumeControl: (value) => updateState('volumeControl', value),
    setBackgroundSoundMute: (enabled) => updateState('backgroundSoundMute', enabled),
    setSoundCaptions: (enabled) => updateState('soundCaptions', enabled),
    setAudioDescriptions: (enabled) => updateState('audioDescriptions', enabled),
    
    // Advanced Tools setters
    setPageMagnifier: (enabled) => updateState('pageMagnifier', enabled),
    setMagnifierZoom: (zoom) => updateState('magnifierZoom', zoom),
    setVirtualMagnifier: (enabled) => updateState('virtualMagnifier', enabled),
    setScreenReaderMode: (enabled) => updateState('screenReaderMode', enabled),
    setPdfMode: (enabled) => updateState('pdfMode', enabled),
    
    // System setters
    setPanelOpen: (open) => updateState('panelOpen', open),
    setWidgetPosition: (position) => updateState('widgetPosition', position),
    
    // Profile management
    saveProfile,
    loadProfile,
    deleteProfile,
    
    // Utility
    resetAll,
    resetCategory,
  };

  return (
    <AccessibilityContextV2.Provider value={contextValue}>
      {children}
    </AccessibilityContextV2.Provider>
  );
};

export const useAccessibilityV2 = () => {
  const context = useContext(AccessibilityContextV2);
  if (!context) {
    throw new Error('useAccessibilityV2 must be used within AccessibilityProviderV2');
  }
  return context;
};

export default AccessibilityContextV2;
