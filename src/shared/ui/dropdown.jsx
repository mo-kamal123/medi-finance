import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MENU_WIDTH = 200;
const OFFSET = 8;

const Dropdown = ({
  isOpen,
  onClose,
  children,
  anchorRef,
  width = MENU_WIDTH,
}) => {
  const ref = useRef(null);
  const [style, setStyle] = useState({
    position: 'fixed',
    top: -9999,
    left: -9999,
  });

  useLayoutEffect(() => {
    if (!isOpen || !anchorRef?.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const menuWidth = Math.min(width, window.innerWidth - 16);
      const height = ref.current?.offsetHeight || 176;
      const belowSpace = window.innerHeight - rect.bottom;
      const openUp = belowSpace < height + OFFSET;
      const top = openUp
        ? Math.max(8, rect.top - height - OFFSET)
        : rect.bottom + OFFSET;

      let left = rect.right - menuWidth;
      if (left < 8) left = Math.max(8, rect.left);
      if (left + menuWidth > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - menuWidth - 8);
      }

      setStyle({
        position: 'fixed',
        top,
        left,
        width: menuWidth,
        zIndex: 9999,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, anchorRef, width]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e) => {
      const insideDropdown = ref.current?.contains(e.target);
      const insideAnchor = anchorRef?.current?.contains(e.target);
      if (!insideDropdown && !insideAnchor) onClose();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={ref}
      style={style}
      className="z-9999 min-w-48 overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-gray-200/60 ring-1 ring-black/5"
    >
      {children}
    </div>,
    document.body
  );
};

export default Dropdown;
