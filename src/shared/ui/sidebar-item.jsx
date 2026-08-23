import { useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const SidebarItem = ({ item, openSidebar, depth = 0, isOpen: controlledOpen, onToggle }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const toggle = () => (onToggle ? onToggle() : setInternalOpen((prev) => !prev));
  const groupRef = useRef(null);
  const Icon = item.icon;
  const hasChildren = Array.isArray(item.sub) && item.sub.length > 0;

  useEffect(() => {
    if (!isOpen || !openSidebar) return;
    const el = groupRef.current;
    const scroller = el?.closest('nav');
    if (!el || !scroller) return;
    const rect = el.getBoundingClientRect();
    const sRect = scroller.getBoundingClientRect();
    if (rect.bottom > sRect.bottom - 8) {
      scroller.scrollBy({ top: rect.bottom - sRect.bottom + 64, behavior: 'smooth' });
    }
  }, [isOpen, openSidebar]);

  if (!hasChildren) {
    return (
      <li>
        <NavLink
          to={item.link || '#'}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg transition-colors
            ${depth === 0 ? 'py-2.5 pl-3 pr-3 text-[17px]' : ''}
            ${depth === 1 ? 'py-2 pl-3 pr-3 text-[15px] font-medium' : ''}
            ${depth >= 2 ? 'py-2 pl-3 pr-3 text-[14px]' : ''}
            ${
              isActive
                ? 'bg-white text-primary shadow-sm font-semibold'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }
            ${depth >= 2 && !isActive ? 'font-normal' : ''}`
          }
        >
          {depth >= 2 ? (
            <span className="mx-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
          ) : (
            <Icon size={depth === 0 ? (openSidebar ? 20 : 26) : 16} className="shrink-0" />
          )}
          {openSidebar && <span className="truncate">{item.name}</span>}
        </NavLink>
      </li>
    );
  }

  const isTopLevel = depth === 0;

  return (
    <li>
      {/* Group */}
      <button
        ref={groupRef}
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className={`flex w-full items-center rounded-lg transition-colors
        ${isTopLevel ? 'text-[17px] font-bold' : 'py-2 pl-3 pr-3 text-[15px] font-semibold'}
        ${openSidebar ? 'justify-between' : 'justify-center'}
        ${isTopLevel ? (openSidebar ? 'px-2 py-2.5' : 'p-3') : ''}
        ${isOpen ? 'text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
      >
        <span className="flex items-center gap-3">
          <span
            className={`flex shrink-0 items-center justify-center rounded-md transition-colors
            ${isTopLevel ? 'h-9 w-9 bg-white/10' : 'h-7 w-7 bg-white/[0.07]'}`}
          >
            <Icon size={isTopLevel ? (openSidebar ? 18 : 24) : 14} />
          </span>
          {openSidebar && <span>{item.name}</span>}
        </span>

        {openSidebar && (
          <ChevronLeft
            size={16}
            className={`transition-transform duration-200 ${
              isOpen ? 'rotate-90 text-white' : 'text-white/40'
            }`}
          />
        )}
      </button>

      {/* Children */}
      {openSidebar && isOpen && (
        <ul
          className={`mt-1 space-y-1 border-r border-white/10 ${
            isTopLevel ? 'mr-6 pr-3' : 'mr-4 pr-2'
          }`}
        >
          {item.sub.map((child) => (
            <SidebarItem
              key={child.name}
              item={child}
              openSidebar={openSidebar}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default SidebarItem;
