import { ArrowLeft, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserPageHeader = ({ user }) => {
  return (
    <header className="overflow-hidden rounded-2xl bg-linear-to-r from-primary to-primary/80 px-6 py-6 text-white sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner"
            aria-hidden="true"
          >
            {user ? (
              <span className="text-2xl font-bold">{user.name?.[0]}</span>
            ) : (
              <UserPlus size={28} />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold">
              {user?.name ?? 'إضافة مستخدم جديد'}
            </h1>
            <p className="mt-0.5 text-white/70">
              {user ? (
                <span dir="ltr">{user.mobileNumber ?? user.username}</span>
              ) : (
                'إنشاء بيانات المستخدم وتحديد الدور وحالة الحساب'
              )}
            </p>
          </div>
        </div>
        <Link
          to="/users"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-base font-medium transition-colors hover:bg-white/30"
        >
          العودة إلى المستخدمين
          <ArrowLeft size={16} />
        </Link>
      </div>
      {/* {user && (
        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-white/20 pt-5 sm:grid-cols-2 xl:grid-cols-5">
          <div>
            <dt className="text-sm text-white/70">كود المستخدم</dt>
            <dd className="mt-1 font-medium">
              <span dir="ltr">{user.id}</span>
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-sm text-white/70">البريد الإلكتروني</dt>
            <dd className="mt-1 break-all font-medium">
              <span dir="ltr">{user.email}</span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-white/70">الدور</dt>
            <dd className="mt-1 font-medium">{roleName}</dd>
          </div>
          <div>
            <dt className="text-sm text-white/70">الحالة</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-sm font-medium ${user.status === 'active' ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-red-200 bg-red-100 text-red-700'}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {user.status === 'active' ? 'نشط' : 'غير نشط'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-white/70">آخر تسجيل دخول</dt>
            <dd className="mt-1 font-medium">
              {user.lastLogin ? formatDate(user.lastLogin) : 'لم يسجل الدخول'}
            </dd>
          </div>
        </dl>
      )} */}
    </header>
  );
};

export default UserPageHeader;
