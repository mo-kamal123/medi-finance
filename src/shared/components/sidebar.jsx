import { useState } from 'react';
import {
  Calculator,
  Users,
  FolderTree,
  FileText,
  FileBarChart,
  BookOpen,
  Scale,
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
        { name: 'شجرة الحسابات', link: '/accounts-tree', icon: FolderTree },
        { name: 'شجرة التكاليف', link: '/cost-tree', icon: FolderTree },
        { name: 'القيود اليومية', link: '/entries', icon: FileText },
      ],
    },
    {
      name: 'الفواتير',
      icon: Users,
      sub: [
        { name: 'فواتير العملاء', link: '/customers-invoices', icon: Users },
        { name: 'فواتير المورديين', link: '/suppliers-invoices', icon: Users },
      ],
    },
    {
      name: 'التقارير',
      icon: FileBarChart,
      sub: [
        { name: 'حساب الأستاذ', link: '/general-ledger', icon: BookOpen },
        { name: 'ميزان المراجعة', link: '/trial-balance', icon: Scale },
      ],
    },
    {
      name: 'العملاء',
      icon: FileBarChart,
      link: '/customers',
    },
    {
      name: 'المورديين',
      icon: FileBarChart,
      link: '/suppliers',
    },
    {
      name: 'الأوراق التجارية',
      icon: FileBarChart,
      link: '/commercial-papers',
    }
  ];

  return (
    <aside
      className={`
    bg-primary h-screen text-white
    transition-all duration-300 ease-in-out overflow-hidden
    ${openSidebar ? 'w-72 p-4 shadow-2xl' : 'w-0 p-0'}
  `}
    >
      {/* Only show content if sidebar is open */}
      <div
        className={`${openSidebar ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      >
        {/* Header */}
        <div className="mb-6 flex items-center gap-2 px-2 justify-start">
          <img src={logo} alt="logo" className="w-100" />
        </div>

        <ul className="space-y-1">
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
          {/* <li>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
                ${isActive ? 'bg-primary/20 text-primary font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'}`
              }
            >
              <Settings size={18} />
              <span>الإعدادات</span>
            </NavLink>
          </li> */}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
