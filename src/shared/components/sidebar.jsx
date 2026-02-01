import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calculator,
  Settings,
  FolderTree,
  FileText,
  BarChart3,
  Users,
} from 'lucide-react';
import SidebarItem from '../ui/sidebar-item';
import { useSelector } from 'react-redux';
import logo from '../../app/assets/logo.png';

const Sidebar = () => {
  const [active, setActive] = useState(null);
  const [, setSubActive] = useState(null);
  const openSidebar = useSelector((state) => state.main.sidebar);

  const toggle = (name) => {
    setActive((prev) => (prev === name ? null : name));
  };

  const links = [
    {
      name: 'محاسبة',
      icon: Calculator,
      sub: [
        { name: 'شجرة الحسابات', link: '/', icon: FolderTree },
        { name: 'القيود اليومية', link: '/', icon: FileText },
        { name: 'التقارير', link: '/', icon: BarChart3 },
      ],
    },
    {
      name: 'إدارة',
      icon: Users,
      sub: [
        { name: 'المستخدمين', link: '/', icon: Users },
        { name: 'الصلاحيات', link: '/', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`
        bg-[#134c5e] h-svh text-white shadow-[-6px_0_20px_rgba(0,0,0,0.35)]
        transition-all duration-300 ease-in-out
        ${openSidebar ? 'w-72 p-4' : 'w-20 p-2'}
      `}
    >
      {/* Header */}
      <div
        className={`mb-6 flex items-center gap-2 transition-all
        ${openSidebar ? 'px-2 justify-start' : 'justify-center'}
      `}
      >
        {/* <Calculator size={20} /> */}
        {openSidebar && (
          <div className="w-full ">
            {/* <div className="text-3xl text-center font-semibold sub-font text-white">
              Medi Finance
            </div> */}
          </div>
        )}
        <img src={logo} alt="logo" className="w-100" />
      </div>

      <ul className={`   ${openSidebar ? 'space-y-1' : 'space-y-1 mt-14'}`}>
        {links.map((link) => (
          <SidebarItem
            key={link.name}
            active={active}
            toggle={toggle}
            item={link}
            openSidebar={openSidebar}
            setSubActive={setSubActive}
          />
        ))}

        {/* Settings */}
        <li>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
              ${
                isActive
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }
              ${!openSidebar ? 'justify-center px-0' : ''}
            `
            }
          >
            <Settings size={18} />
            {openSidebar && <span>الإعدادات</span>}
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
