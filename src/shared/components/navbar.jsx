import { ChevronRight, CircleChevronRight, Power } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials } from '../../features/auth/store/auth-slice';
import { toggleSidebar } from '../store/main-slice';
import { removeFromLocalStorage } from '../utils/local-storage-actions';
import ThemePicker from './theme-picker';

const Navbar = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.main.sidebar);
  const user = useSelector((state) => state.auth.user);
  const displayName = user?.fullName || user?.username || '';

  const handleLogout = () => {
    removeFromLocalStorage('token');
    removeFromLocalStorage('user');
    dispatch(clearCredentials());
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-2xl ps-0 pe-4 sm:pe-6 h-16 flex items-center justify-between">
      {/* welcome section */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          aria-label={isOpen ? 'إغلاق القائمة الجانبية' : 'فتح القائمة الجانبية'}
          aria-expanded={isOpen}
          className="flex h-8 w-6 shrink-0 items-center justify-center rounded-e-full bg-primary text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ChevronRight
            aria-hidden="true"
            className={`h-6 w-6 pr-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0 pl-1'}`}
          />
        </button>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          مرحباً بك{' '}
          <span className="sub-font font-bold inline text-primary">
            {displayName}
          </span>{' '}
          في{' '}
          <span className="sub-font font-bold inline text-primary">
            Medi Finance
          </span>
        </h1>
      </div>

      {/* actions */}
      <div className="flex items-center gap-2">
        <ThemePicker />

        <button
          className="p-2 rounded-lg hover:bg-red-50 transition"
          aria-label="Logout"
          onClick={handleLogout}
        >
          <Power className="w-5 h-5 text-red-500" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
