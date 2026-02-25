import { useEffect, useRef } from 'react';

const Dropdown = ({ isOpen, onClose, children }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute -right-36 top-8 w-40 bg-white border rounded-lg shadow-lg z-50"
    >
      {children}
    </div>
  );
};

export default Dropdown;
