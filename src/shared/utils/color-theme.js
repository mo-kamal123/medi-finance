export const COLOR_THEMES = [
  { id: 'teal', label: 'الافتراضي', color: '#236167' },
  { id: 'green', label: 'أخضر', color: '#047857' },
  { id: 'rose', label: 'وردي', color: '#be123c' },
  { id: 'dark-red', label: 'أحمر داكن', color: '#280E0E' },
  { id: 'dark-green', label: 'أخضر داكن', color: '#11280E' },
  { id: 'dark-blue', label: 'أزرق داكن', color: '#0E1328' },
  { id: 'dark-purple', label: 'بنفسجي داكن', color: '#250E28' },
];

const STORAGE_KEY = 'mediconsult-color-theme';

export const getSavedColorTheme = () => {
  try {
    const savedId = localStorage.getItem(STORAGE_KEY);
    return COLOR_THEMES.find((theme) => theme.id === savedId) || COLOR_THEMES[0];
  } catch {
    return COLOR_THEMES[0];
  }
};

export const applyColorTheme = (theme) => {
  // Both tokens represent the same main accent throughout the application.
  document.documentElement.style.setProperty('--color-main', theme.color);
  document.documentElement.style.setProperty('--color-primary', theme.color);
};

export const saveColorTheme = (theme) => {
  applyColorTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme.id);
  } catch {
    // The selected color still applies when browser storage is unavailable.
  }
};
