import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  // Signals are perfect for UI state
  darkMode = signal<boolean>(true);
  accentColor = signal<string>('#6610f2'); // Default Blue

  constructor() {
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.setDarkMode(false);
    } else {
      this.setDarkMode(true);
    }
    
    const savedAccent = localStorage.getItem('accent');
    if (savedAccent) {
      this.setAccentColor(savedAccent);
    } else {
      // Ensure the default RGB variable is set correctly on load if no custom color exists
      this.updateCssVariables('#6610f2');
    }
  }

  toggleTheme() {
    this.animateThemeSwitch();
    this.setDarkMode(!this.darkMode());
  }
  
  private animateThemeSwitch() {
    // 1. Add a class that forces transition on EVERYTHING
    document.body.classList.add('theme-transitioning');
    
    // 2. Remove it after the transition finishes (e.g., 300ms)
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300); 
  }

  setDarkMode(isDark: boolean) {
    this.darkMode.set(isDark);
    if (isDark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  setAccentColor(color: string) {
    this.accentColor.set(color);
    localStorage.setItem('accent', color);
    
    // Update both the HEX and RGB variables
    this.updateCssVariables(color);
  }

  private updateCssVariables(hex: string) {
    // 1. Set the main HEX variable (used for solid backgrounds/text)
    document.documentElement.style.setProperty('--accent-color', hex);

    // 2. Convert to RGB and set the RGB variable (used for rgba opacities)
    const rgb = this.hexToRgb(hex);
    if (rgb) {
      document.documentElement.style.setProperty('--accent-color-rgb', rgb);
    }
  }

  /**
   * Helper to convert Hex (#007bff) to RGB string (0, 123, 255)
   */
  private hexToRgb(hex: string): string | null {
    // Remove the hash symbol if present
    hex = hex.replace(/^#/, '');

    // Handle 3-digit hex (e.g. #FFF) -> 6-digit (FFFFFF)
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }

    // Ensure it's a valid hex length
    if (hex.length !== 6) {
      return null;
    }

    // Parse the values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  }
}