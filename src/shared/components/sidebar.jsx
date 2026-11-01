import SidebarItem from '../ui/sidebar-item';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { clearCredentials } from '../../features/auth/store/auth-slice';
import { removeFromLocalStorage } from '../utils/local-storage-actions';
import logo from '../../app/assets/logo.png';
import { links } from '../utils/sidebar-data';
import { useState } from 'react';

const Sidebar = () => {
  const dispatch = useDispatch();
  const openSidebar = useSelector((state) => state.main.sidebar);
  const user = useSelector((state) => state.auth.user);
  const [openGroup, setOpenGroup] = useState(null);
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.fullName ||
    user?.mobileNumber ||
    user?.username ||
    'المستخدم';
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((name) => Array.from(name)[0])
    .join('');
  const roles = user?.roles || [];

  const handleLogout = () => {
    removeFromLocalStorage('token');
    removeFromLocalStorage('user');
    dispatch(clearCredentials());
  };

  return (
    <aside
      className={`
        bg-primary h-screen shrink-0 text-white flex flex-col
        transition-all duration-300 ease-in-out overflow-hidden
        ${openSidebar ? 'w-78 px-4 pb-4  shadow-2xl' : 'w-0 p-0'}
      `}
    >
      <div
        className={`${openSidebar ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 flex flex-col flex-1 min-h-0 overflow-hidden`}
      >
        <div className='w-full h-16 overflow-hidden border-b border-white/15   mb-6'>
          <div className="flex shrink-0 items-center justify-start gap-2 px-2">
            <img src={logo} alt="logo" className="-mt-2" />
          </div>
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

        <div className="mt-3 shrink-0 border-t border-white/15 pt-4">
          <section
            dir="ltr"
            aria-label="الملف الشخصي"
            className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/15 to-white/5 p-4 shadow-lg shadow-black/10"
          >
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-base font-bold text-primary shadow-sm"
              >
                {user ? initials : <UserRound size={22} />}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p dir="auto" className="break-words text-sm font-semibold leading-6 text-white">
                  {displayName}
                </p>
                {roles.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex max-w-full items-center gap-1 text-xs font-medium text-teal-100"
                      >
                        <ShieldCheck size={13} className="shrink-0" aria-hidden="true" />
                        <span dir="auto" className="break-words">{role}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="تسجيل الخروج"
                title="تسجيل الخروج"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80 transition-colors hover:border-red-200/30 hover:bg-red-500/20 hover:text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <LogOut size={18} aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
