import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../../shared/components/navbar';
import Sidebar from '../../shared/components/sidebar';
import { useSelector } from 'react-redux';

const RootLayout = () => {
  const loggedIn = useSelector((state) => state.auth.token);

  if (!loggedIn) {
    return <Navigate to="/auth" replace/>;
  }

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <Sidebar />

      {/* Right side (Navbar + Content) */}
      <div className="flex flex-col flex-1">
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
