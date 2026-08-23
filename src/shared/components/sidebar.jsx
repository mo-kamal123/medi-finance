import SidebarItem from '../ui/sidebar-item';
import { useSelector } from 'react-redux';
import logo from '../../app/assets/logo.png';
import khusum from '../../app/assets/Khusm Logo (1).png';
import { links } from '../utils/sidebar-data';
import { useState } from 'react';

const Sidebar = () => {
  const openSidebar = useSelector((state) => state.main.sidebar);
  const [openGroup, setOpenGroup] = useState(null);

  return (
    <aside
      className={`
        bg-primary h-screen shrink-0 text-white flex flex-col
        transition-all duration-300 ease-in-out overflow-hidden
        ${openSidebar ? 'w-78 p-4 shadow-2xl' : 'w-0 p-0'}
      `}
    >
      <div
        className={`${openSidebar ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 flex flex-col flex-1`}
      >
        <div className="mb-4 flex shrink-0 items-center justify-start gap-2 px-2">
          <img src={logo} alt="logo" className="w-100" />
        </div>

        <nav
          className={`
            flex-1 min-h-0 overflow-y-auto overscroll-contain pl-1 pr-0.5
            [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-white/15
            [&::-webkit-scrollbar-thumb:hover]:bg-white/30
          `}
        >
          <ul className="space-y-1.5 pb-4">
            {links.map((link) => (
              <SidebarItem
                key={link.name}
                item={link}
                openSidebar={openSidebar}
                isOpen={openGroup === link.name}
                onToggle={() =>
                  setOpenGroup((prev) => (prev === link.name ? null : link.name))
                }
              />
            ))}
          </ul>
        </nav>

        <div className="pt-3 flex shrink-0 flex-col items-end justify-center gap-2 px-2">
          <p className="text-2xl text-white font-bold">powered by</p>
          <img src={khusum} alt="logo" className="w-100" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
