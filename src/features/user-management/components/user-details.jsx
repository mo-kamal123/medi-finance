import { useState } from 'react';
import { Search, ShieldCheck, UserRound } from 'lucide-react';
import StatusBadge from './status-badge';
import { formatDate } from '../../../shared/utils/formatters';

const sectionNames = {
  Accounting: 'المحاسبة',
  Administration: 'الإدارة',
  Banking: 'البنوك',
  Reports: 'التقارير',
  Sales: 'المبيعات',
  Treasury: 'الخزينة',
};

const UserDetails = ({ user }) => {
  const [search, setSearch] = useState('');
  const permissions = user.permissions ?? [];
  const filtered = permissions.filter((permission) =>
    permission.toLowerCase().includes(search.trim().toLowerCase())
  );
  const groups = Object.groupBy(filtered, (permission) => permission.split('.')[0]);
  const fields = [
    ['كود المستخدم', user.userID ?? user.id],
    ['الاسم الأول', user.firstName],
    ['اسم العائلة', user.lastName],
    ['رقم الهاتف', <span dir="ltr">{user.mobileNumber}</span>],
    ['الحالة', <StatusBadge status={user.status} />],
    ['تاريخ الإنشاء', formatDate(user.createdAt, { hour: '2-digit', minute: '2-digit', second: '2-digit' })],
    ['آخر تحديث', formatDate(user.updatedAt, { hour: '2-digit', minute: '2-digit', second: '2-digit' })],
  ];

  return (
    <div dir="rtl" className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <UserRound size={20} className="text-primary" />
          المعلومات الأساسية
        </h2>
        <dl className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {fields.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-sm text-gray-500">{label}</dt>
              <dd className="mt-2 break-words text-sm font-medium text-gray-900">{value ?? '—'}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 border-t border-gray-100 pt-5">
          <h3 className="mb-3 text-sm font-medium text-gray-500">الأدوار</h3>
          <div className="flex flex-wrap gap-2">
            {(user.roles ?? []).map((role) => (
              <span key={role} dir="auto" className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                <ShieldCheck size={15} aria-hidden="true" />{role}
              </span>
            ))}
            {!user.roles?.length && <p className="text-sm text-gray-500">لا توجد أدوار</p>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6" aria-labelledby="user-permissions-title">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 id="user-permissions-title" className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <ShieldCheck size={20} className="text-primary" />
            الصلاحيات
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm text-primary">{permissions.length}</span>
          </h2>
          <div className="relative w-full sm:w-80">
            <Search size={17} aria-hidden="true" className="pointer-events-none absolute right-3 top-3 text-gray-400" />
            <input
              type="search"
              aria-label="بحث في الصلاحيات"
              placeholder="بحث في الصلاحيات..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>
        <p role="status" className="mb-4 text-sm text-gray-500">عرض {filtered.length} من {permissions.length} صلاحية</p>
        <div className="space-y-4">
          {Object.entries(groups).map(([group, items]) => (
            <details key={group} open className="overflow-hidden rounded-xl border border-gray-200">
              <summary className="cursor-pointer bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800">
                {sectionNames[group] ?? group} <span className="mr-2 font-normal text-gray-500">({items.length})</span>
              </summary>
              <ul dir="ltr" className="grid gap-2 p-4 text-left sm:grid-cols-2 xl:grid-cols-3">
                {items.map((permission) => (
                  <li key={permission} className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-xs leading-5 text-gray-700">
                    <ShieldCheck size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
                    <span className="min-w-0 break-words">{permission}</span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
          {filtered.length === 0 && <p className="py-6 text-center text-sm text-gray-500">{permissions.length ? 'لا توجد صلاحيات تطابق البحث' : 'لا توجد صلاحيات'}</p>}
        </div>
      </section>
    </div>
  );
};

export default UserDetails;
