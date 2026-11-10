import { useCallback, useId, useRef, useState } from 'react';
import { Check, Settings } from 'lucide-react';
import Dropdown from '../ui/dropdown';
import Toggle from '../ui/toggle';
import { getSavedColorMode, saveColorMode } from '../utils/color-mode';
import { COLOR_THEMES, getSavedColorTheme, saveColorTheme } from '../utils/color-theme';

const ThemePicker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(getSavedColorTheme);
  const [colorMode, setColorMode] = useState(getSavedColorMode);
  const buttonRef = useRef(null);
  const panelId = useId();
  const close = useCallback(() => setIsOpen(false), []);
  const visibleThemes = COLOR_THEMES.filter(
    (theme) => colorMode !== 'dark' || !theme.id.startsWith('dark-')
  );

  const selectTheme = (theme) => {
    saveColorTheme(theme);
    setSelectedTheme(theme);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="rounded-lg p-2 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="إعدادات لون الواجهة"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
      >
        <Settings className="h-5 w-5 text-gray-600" />
      </button>
      <Dropdown isOpen={isOpen} onClose={close} anchorRef={buttonRef} width={288}>
        <div id={panelId} className="p-3" dir="rtl">
          <div className="mb-4 border-b border-gray-200 pb-4">
            <Toggle
              label="الوضع الداكن"
              checked={colorMode === 'dark'}
              onChange={(event) => {
                const mode = event.target.checked ? 'dark' : 'light';
                if (mode === 'dark') {
                  selectTheme(COLOR_THEMES[0]);
                }
                saveColorMode(mode);
                setColorMode(mode);
              }}
            />
          </div>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">اللون الرئيسي</h2>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="ألوان الواجهة">
            {visibleThemes.map((theme) => {
              const selected = selectedTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectTheme(theme)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: theme.color }} aria-hidden="true">
                    {selected && <Check size={15} />}
                  </span>
                  {theme.label}
                </button>
              );
            })}
          </div>
        </div>
      </Dropdown>
    </>
  );
};

export default ThemePicker;
