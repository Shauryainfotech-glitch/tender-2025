import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

interface KeyboardShortcut {
  id: string;
  action: string;
  keys: string[];
  description: string;
  category: string;
  customizable: boolean;
}

interface WCAGViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: any[];
  tags: string[];
}

interface AccessibilityAuditResult {
  score: number;
  violations: WCAGViolation[];
  passes: number;
  warnings: number;
  inapplicable: number;
  timestamp: Date;
}

class AccessibilityService {
  private settings: AccessibilitySettings;
  private screenReader: SpeechSynthesisUtterance | null = null;
  private keyboardShortcuts: Map<string, () => void> = new Map();

  constructor() {
    this.settings = this.loadSettings();
    this.initializeAccessibility();
  }

  private initializeAccessibility() {
    // Initialize screen reader
    if ('speechSynthesis' in window) {
      this.screenReader = new SpeechSynthesisUtterance();
    }

    // Set up keyboard navigation
    this.setupKeyboardNavigation();

    // Apply initial settings
    this.applySettings(this.settings);

    // Set up ARIA live regions
    this.setupAriaLiveRegions();
  }

  private setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (!this.settings.keyboardNavigation) return;

      const key = this.getKeyCombo(e);
      const handler = this.keyboardShortcuts.get(key);
      
      if (handler) {
        e.preventDefault();
        handler();
      }
    });

    // Default keyboard shortcuts
    this.registerShortcut('Alt+H', () => this.openAccessibilityHelp());
    this.registerShortcut('Alt+M', () => this.skipToMain());
    this.registerShortcut('Alt+N', () => this.skipToNavigation());
    this.registerShortcut('Alt+S', () => this.skipToSearch());
    this.registerShortcut('Escape', () => this.closeFocusTrap());
  }

  private getKeyCombo(event: KeyboardEvent): string {
    const parts = [];
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');
    parts.push(event.key.toUpperCase());
    return parts.join('+');
  }

  registerShortcut(keys: string, handler: () => void) {
    this.keyboardShortcuts.set(keys, handler);
  }

  unregisterShortcut(keys: string) {
    this.keyboardShortcuts.delete(keys);
  }

  // Settings management
  getDefaultSettings(): AccessibilitySettings {
    return {
      // Visual
      highContrast: false,
      colorBlindMode: 'none',
      fontSize: 'medium',
      fontFamily: 'default',
      reducedMotion: false,
      cursorSize: 'normal',
      
      // Audio
      screenReaderEnabled: false,
      soundEffects: true,
      voiceSpeed: 1,
      voicePitch: 1,
      
      // Navigation
      keyboardNavigation: true,
      focusIndicator: 'default',
      skipLinks: true,
      stickyFocus: false,
      
      // Interaction
      clickDelay: 0,
      doubleClickSpeed: 500,
      autoCompleteEnabled: true,
      confirmActions: false,
      
      // Content
      simplifiedUI: false,
      readingMode: false,
      hideImages: false,
      captions: true
    };
  }

  loadSettings(): AccessibilitySettings {
    const saved = localStorage.getItem('accessibilitySettings');
    return saved ? JSON.parse(saved) : this.getDefaultSettings();
  }

  async saveSettings(settings: AccessibilitySettings): Promise<void> {
    this.settings = settings;
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    
    try {
      await axios.post(`${API_BASE_URL}/accessibility/settings`, settings);
    } catch (error) {
      console.error('Failed to save accessibility settings to server:', error);
    }
    
    this.applySettings(settings);
  }

  updateSettings(settings: Partial<AccessibilitySettings>) {
    this.settings = { ...this.settings, ...settings };
    this.applySettings(this.settings);
  }

  private applySettings(settings: AccessibilitySettings) {
    // Apply CSS classes and attributes
    const body = document.body;
    const root = document.documentElement;

    // High contrast
    body.classList.toggle('high-contrast', settings.highContrast);

    // Color blind modes
    body.setAttribute('data-color-blind-mode', settings.colorBlindMode);

    // Font size
    const fontSizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);

    // Reduced motion
    body.classList.toggle('reduced-motion', settings.reducedMotion);

    // Cursor size
    body.setAttribute('data-cursor-size', settings.cursorSize);

    // Focus indicators
    body.setAttribute('data-focus-style', settings.focusIndicator);

    // Keyboard navigation
    body.setAttribute('data-keyboard-nav', settings.keyboardNavigation.toString());

    // Skip links
    this.toggleSkipLinks(settings.skipLinks);

    // Screen reader
    if (this.screenReader) {
      this.screenReader.rate = settings.voiceSpeed;
      this.screenReader.pitch = settings.voicePitch;
    }
  }

  // WCAG Compliance
  async checkWCAGCompliance(): Promise<number> {
    try {
      const response = await axios.get(`${API_BASE_URL}/accessibility/compliance`);
      return response.data.score;
    } catch (error) {
      // Fallback to client-side basic check
      return this.performBasicAccessibilityCheck();
    }
  }

  private performBasicAccessibilityCheck(): number {
    let score = 100;
    const deductions: { [key: string]: number } = {};

    // Check for alt text on images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt) {
        deductions['missing-alt'] = (deductions['missing-alt'] || 0) + 2;
      }
    });

    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1]);
      if (level > previousLevel + 1) {
        deductions['heading-order'] = (deductions['heading-order'] || 0) + 1;
      }
      previousLevel = level;
    });

    // Check for form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const id = input.id;
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (!label) {
          deductions['missing-label'] = (deductions['missing-label'] || 0) + 2;
        }
      }
    });

    // Check for color contrast
    // This is a simplified check - real implementation would use color analysis
    if (!this.settings.highContrast) {
      deductions['color-contrast'] = 5;
    }

    // Check for keyboard accessibility
    const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    focusableElements.forEach(elem => {
      if (elem.getAttribute('tabindex') === '-1' && !elem.hasAttribute('aria-hidden')) {
        deductions['keyboard-access'] = (deductions['keyboard-access'] || 0) + 1;
      }
    });

    // Calculate final score
    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
    return Math.max(0, score - totalDeductions);
  }

  async runAccessibilityAudit(): Promise<AccessibilityAuditResult> {
    try {
      const response = await axios.post(`${API_BASE_URL}/accessibility/audit`, {
        url: window.location.href,
        settings: this.settings
      });
      return response.data;
    } catch (error) {
      // Fallback to basic audit
      const score = this.performBasicAccessibilityCheck();
      return {
        score,
        violations: [],
        passes: 0,
        warnings: 0,
        inapplicable: 0,
        timestamp: new Date()
      };
    }
  }

  // Keyboard shortcuts
  async getKeyboardShortcuts(): Promise<KeyboardShortcut[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/accessibility/shortcuts`);
      return response.data;
    } catch (error) {
      return this.getDefaultKeyboardShortcuts();
    }
  }

  private getDefaultKeyboardShortcuts(): KeyboardShortcut[] {
    return [
      {
        id: 'help',
        action: 'Open Help',
        keys: ['Alt', 'H'],
        description: 'Opens the accessibility help dialog',
        category: 'Navigation',
        customizable: true
      },
      {
        id: 'skip-main',
        action: 'Skip to Main',
        keys: ['Alt', 'M'],
        description: 'Skip to main content',
        category: 'Navigation',
        customizable: true
      },
      {
        id: 'skip-nav',
        action: 'Skip to Navigation',
        keys: ['Alt', 'N'],
        description: 'Skip to navigation menu',
        category: 'Navigation',
        customizable: true
      },
      {
        id: 'search',
        action: 'Search',
        keys: ['Ctrl', 'K'],
        description: 'Open search dialog',
        category: 'Actions',
        customizable: true
      },
      {
        id: 'close',
        action: 'Close Dialog',
        keys: ['Escape'],
        description: 'Close current dialog or popup',
        category: 'Actions',
        customizable: false
      }
    ];
  }

  async saveKeyboardShortcut(shortcut: KeyboardShortcut): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/accessibility/shortcuts/${shortcut.id}`, shortcut);
    } catch (error) {
      console.error('Failed to save keyboard shortcut:', error);
    }
  }

  // Screen reader support
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.settings.screenReaderEnabled) return;

    // Use ARIA live region
    const liveRegion = document.querySelector(`[aria-live="${priority}"]`);
    if (liveRegion) {
      liveRegion.textContent = message;
    }

    // Use speech synthesis as backup
    if (this.screenReader && window.speechSynthesis) {
      this.screenReader.text = message;
      window.speechSynthesis.speak(this.screenReader);
    }
  }

  // Navigation helpers
  private skipToMain() {
    const main = document.querySelector('main, [role="main"]');
    if (main instanceof HTMLElement) {
      main.focus();
      main.scrollIntoView();
    }
  }

  private skipToNavigation() {
    const nav = document.querySelector('nav, [role="navigation"]');
    if (nav instanceof HTMLElement) {
      nav.focus();
      nav.scrollIntoView();
    }
  }

  private skipToSearch() {
    const search = document.querySelector('[type="search"], [role="search"] input');
    if (search instanceof HTMLElement) {
      search.focus();
    }
  }

  private openAccessibilityHelp() {
    // Trigger help dialog opening
    const event = new CustomEvent('openAccessibilityHelp');
    window.dispatchEvent(event);
  }

  private closeFocusTrap() {
    const event = new CustomEvent('closeFocusTrap');
    window.dispatchEvent(event);
  }

  private toggleSkipLinks(show: boolean) {
    const skipLinks = document.querySelector('.skip-links');
    if (skipLinks) {
      skipLinks.classList.toggle('hidden', !show);
    }
  }

  private setupAriaLiveRegions() {
    // Create live regions if they don't exist
    if (!document.querySelector('[aria-live="polite"]')) {
      const politeRegion = document.createElement('div');
      politeRegion.setAttribute('aria-live', 'polite');
      politeRegion.setAttribute('aria-atomic', 'true');
      politeRegion.className = 'sr-only';
      document.body.appendChild(politeRegion);
    }

    if (!document.querySelector('[aria-live="assertive"]')) {
      const assertiveRegion = document.createElement('div');
      assertiveRegion.setAttribute('aria-live', 'assertive');
      assertiveRegion.setAttribute('aria-atomic', 'true');
      assertiveRegion.className = 'sr-only';
      document.body.appendChild(assertiveRegion);
    }
  }

  // Focus management
  trapFocus(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    });

    firstFocusable?.focus();
  }

  releaseFocusTrap() {
    // Implementation depends on how focus trap was set up
  }

  // Color contrast checker
  checkColorContrast(foreground: string, background: string): {
    ratio: number;
    AA: boolean;
    AAA: boolean;
  } {
    const getLuminance = (color: string): number => {
      // Convert hex to RGB
      const rgb = parseInt(color.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;

      // Calculate relative luminance
      const rsRGB = r / 255;
      const gsRGB = g / 255;
      const bsRGB = b / 255;

      const r2 = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
      const g2 = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
      const b2 = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

      return 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      ratio,
      AA: ratio >= 4.5,
      AAA: ratio >= 7
    };
  }
}

const accessibilityService = new AccessibilityService();
export default accessibilityService;
