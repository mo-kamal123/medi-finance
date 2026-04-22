import { useState } from 'react';
import {
  Calculator,
  FolderTree,
  FileText,
  Receipt,
  Users,
  Landmark,
  BarChart3,
  BookOpen,
  Scale,
  FileCheck,
  FileClock,
  CreditCard,
  Wallet,
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
        { name: 'الصندوق', link: '/cash-transactions', icon: Wallet },
      ],
    },
    {
      name: 'الفواتير',
      icon: Receipt,
      sub: [
        {
          name: 'فواتير العملاء',
          link: '/customers-invoices',
          icon: FileCheck,
        },
        {
          name: 'فواتير المورديين',
          link: '/suppliers-invoices',
          icon: FileClock,
        },
        {
          name: 'فواتير المطالبات',
          link: '/batches-invoices',
          icon: FileClock,
        },
      ],
    },
    {
      name: 'الأوراق التجارية',
      icon: CreditCard,
      sub: [
        {
          name: 'أوراق القبض',
          link: '/commercial-papers/receivable',
          icon: FileCheck,
        },
        {
          name: 'أوراق الدفع',
          link: '/commercial-papers/payable',
          icon: FileText,
        },
        { name: 'الشيكات', link: '/cheques', icon: CreditCard },
      ],
    },
    {
      name: 'التقارير',
      icon: BarChart3,
      sub: [
        { name: 'حساب الأستاذ', link: '/general-ledger', icon: BookOpen },
        { name: 'ميزان المراجعة', link: '/trial-balance', icon: Scale },
        { name: 'الميزانية العمومية', link: '/balance-sheet', icon: Wallet },
      ],
    },
    {
      name: 'العملاء',
      icon: Users,
      link: '/customers',
    },
    {
      name: 'المورديين',
      icon: Users,
      link: '/suppliers',
    },
    {
      name: 'البنوك',
      icon: Landmark,
      link: '/banks',
    },
  ];

  return (
    <aside
      className={`
    bg-primary h-screen shrink-0 text-white
    transition-all duration-300 ease-in-out overflow-hidden
    ${openSidebar ? 'w-72 p-4 shadow-2xl' : 'w-0 p-0'}
  `}
    >
      <div
        className={`${openSidebar ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      >
        <div className="mb-6 flex items-center justify-start gap-2 px-2">
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
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
