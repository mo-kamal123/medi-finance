import { useId } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from '../../shared/components/navbar';
import Sidebar from '../../shared/components/sidebar';
import { useSelector } from 'react-redux';
import { getCurrentUser } from '../../features/auth/api/auh-api';
import { canViewRoute } from '../../features/auth/route-permissions';
import PageLoader from '../../shared/ui/page-loader';
import khusmLogo from '../assets/Khusm Logo (1).png';

const AuthenticatedLayout = () => {
  const sessionId = useId();
  const { pathname } = useLocation();
  const profile = useQuery({
    queryKey: ['auth', 'me', sessionId],
    queryFn: ({ signal }) => getCurrentUser(signal),
    staleTime: 60 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
    gcTime: 0,
  });
  if (profile.isPending || profile.isFetching) {
    return (
      <div role="status" aria-busy="true" className="h-dvh w-full">
        <PageLoader
          label="جاري تحميل صلاحيات المستخدم..."
          className="h-full rounded-none border-0 bg-white"
        />
      </div>
    );
  }

  if (profile.isError) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div role="alert" className="rounded-xl bg-red-50 p-6 text-red-700">
          تعذر تحميل صلاحيات المستخدم.
          <button type="button" onClick={() => void profile.refetch()} className="mx-3 underline">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const user = profile.data;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar profile={user} />

      {/* Right side (Navbar + Content) */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex min-h-full flex-col">
            <div className="flex-1 p-4 sm:p-6">
              {canViewRoute(user.permissions, pathname) ? (
                <Outlet context={user.permissions} />
              ) : (
                <div role="alert" className="rounded-xl bg-amber-50 p-6 text-amber-800">
                  ليس لديك صلاحية لعرض هذه الصفحة.
                </div>
              )}
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

const RootLayout = () => {
  const token = useSelector((state) => state.auth.token);
  return token ? <AuthenticatedLayout key={token} /> : <Navigate to="/auth" replace />;
};

export default RootLayout;
