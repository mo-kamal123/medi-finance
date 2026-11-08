const STORAGE_KEY = 'mediconsult-color-mode';

export const getSavedColorMode = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const applyColorMode = (mode) => {
  const dark = mode === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
};

export const saveColorMode = (mode) => {
  applyColorMode(mode);
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Switching appearance still works when browser storage is unavailable.
  }
};
