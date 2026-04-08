import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../../shared/components/navbar';
import Sidebar from '../../shared/components/sidebar';
import { useSelector } from 'react-redux';

const RootLayout = () => {
  const loggedIn = useSelector((state) => state.auth.token);

  if (!loggedIn) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Right side (Navbar + Content) */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
