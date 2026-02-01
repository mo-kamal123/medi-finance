import { ChevronLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const SidebarItem = ({ item, active, toggle, openSidebar, setSubActive }) => {
  const isOpen = active === item.name;
  const Icon = item.icon;

  return (
    <li>
      {/* Parent */}
      <button
        onClick={() => toggle(item.name)}
        className={`flex items-center w-full rounded-xl transition-colors
        ${openSidebar ? 'justify-between px-3 py-2.5' : 'justify-center p-3'}
        ${
          isOpen ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={openSidebar ? 18 : 25} />
          {openSidebar && <span>{item.name}</span>}
        </div>

        {openSidebar && (
          <ChevronLeft
            size={16}
            className={`transition-transform ${
              isOpen ? 'rotate-90 text-primary' : 'text-white/60'
            }`}
          />
        )}
      </button>

      {/* Sub items */}
      {openSidebar && isOpen && (
        <ul className="mt-1 space-y-1 pr-6 border-r border-white/10">
          {item.sub.map((sub) => {
            const SubIcon = sub.icon;
            return (
              <li key={sub.name}>
                <NavLink
                  to={sub.link}
                  onClick={() => setSubActive(sub.name)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors
                    ${
                      isActive
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'text-white/70 hover:bg-white/10'
                    }`
                  }
                >
                  <SubIcon size={16} />
                  <span>{sub.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default SidebarItem;
