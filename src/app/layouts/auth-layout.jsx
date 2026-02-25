import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthLayout = () => {
  const loggedIn = useSelector((state) => state.auth.token);
  if (loggedIn) {
    return <Navigate to={'/'} replace />;
  }
  return (
    <div className="auth-bg min-h-svh relative isolate">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 min-h-svh flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
