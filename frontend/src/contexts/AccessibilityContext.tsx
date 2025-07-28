import React, { createContext, useState, useEffect, ReactNode } from 'react';
import accessibilityService from '../services/accessibilityService';

interface AccessibilitySettings {
  // Visual
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: string;
  reducedMotion: boolean;
  cursorSize: 'normal' | 'large' | 'extra-large';
  
  // Audio
  screenReaderEnabled: boolean;
  soundEffects: boolean;
  voiceSpeed: number;
  voicePitch: number;
  
  // Navigation
  keyboardNavigation: boolean;
  focusIndicator: 'default' | 'high-visibility' | 'custom';
  skipLinks: boolean;
  stickyFocus: boolean;
  
  // Interaction
  clickDelay: number;
  doubleClickSpeed: number;
  autoCompleteEnabled: boolean;
  confirmActions: boolean;
  
  // Content
  simplifiedUI: boolean;
  readingMode: boolean;
  hideImages: boolean;
  captions: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  registerShortcut: (keys: string, handler: () => void) => void;
  unregisterShortcut: (keys: string) => void;
  checkContrast: (foreground: string, background: string) => { ratio: number; AA: boolean; AAA: boolean };
}

const defaultSettings = accessibilityService.getDefaultSettings();

export const AccessibilityContext = createContext<AccessibilityContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  announce: () => {},
  registerShortcut: () => {},
  unregisterShortcut: () => {},
  checkContrast: () => ({ ratio: 0, AA: false, AAA: false })
});

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(
    accessibilityService.loadSettings()
  );

  useEffect(() => {
    // Apply settings on mount
    accessibilityService.updateSettings(settings);

    // Listen for settings changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessibilitySettings' && e.newValue) {
        const newSettings = JSON.parse(e.newValue);
        setSettings(newSettings);
        accessibilityService.updateSettings(newSettings);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateSettings = (partialSettings: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings, ...partialSettings };
    setSettings(newSettings);
    accessibilityService.updateSettings(newSettings);
  };

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    accessibilityService.announce(message, priority);
  };

  const registerShortcut = (keys: string, handler: () => void) => {
    accessibilityService.registerShortcut(keys, handler);
  };

  const unregisterShortcut = (keys: string) => {
    accessibilityService.unregisterShortcut(keys);
  };

  const checkContrast = (foreground: string, background: string) => {
    return accessibilityService.checkColorContrast(foreground, background);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        announce,
        registerShortcut,
        unregisterShortcut,
        checkContrast
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
