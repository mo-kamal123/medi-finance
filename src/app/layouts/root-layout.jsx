import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../../shared/components/navbar';
import Sidebar from '../../shared/components/sidebar';
import { useSelector } from 'react-redux';
import khusmLogo from '../assets/Khusm Logo (1).png';

const RootLayout = () => {
  const loggedIn = useSelector((state) => state.auth.token);

  if (!loggedIn) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Right side (Navbar + Content) */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex min-h-full flex-col">
            <div className="flex-1 p-4 sm:p-6">
              <Outlet />
            </div>
            <footer className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
              <div dir="ltr" className="flex items-center justify-center gap-3">
                <span className="text-xs font-medium text-gray-500">Powered by</span>
                <img src={khusmLogo} alt="Khusm" className="h-7 w-auto object-contain" />
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
