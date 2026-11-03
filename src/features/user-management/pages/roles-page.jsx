import { useQuery } from '@tanstack/react-query';
import { Plus, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRoles } from '../api/roles.api';
import ManagementTablePage from '../components/management-table-page';
import StatusBadge from '../components/status-badge';

const columns = [
  {
    header: 'الدور',
    key: 'name',
    type: 'custom',
    render: (role) => (
      <Link
        to={`/roles/${encodeURIComponent(role.id)}`}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 font-medium text-primary hover:bg-primary/10 hover:underline"
      >
        <ShieldCheck size={16} className="shrink-0" aria-hidden="true" />
        <bdi>{role.name}</bdi>
      </Link>
    ),
  },
  { header: 'الوصف', key: 'description' },
  { header: 'عدد الصلاحيات', key: 'permissionCount' },
  { header: 'عدد المستخدمين', key: 'userCount' },
  {
    header: 'الحالة',
    key: 'status',
    type: 'custom',
    render: (row) => <StatusBadge status={row.status} />,
  },
];

const RolesPage = () => {
  const {
    data = [],
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: ({ signal }) => getRoles(signal),
  });

  return (
    <ManagementTablePage
      title="الأدوار"
      description="عرض أدوار المستخدمين وعدد الصلاحيات لكل دور"
      data={data}
      columns={columns}
      headerAction={
        <Link
          to="/roles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90"
        >
          <Plus size={18} aria-hidden="true" />
          إضافة دور جديد
        </Link>
      }
      searchKeys={['name', 'description']}
      searchPlaceholder="ابحث باسم الدور أو الوصف"
      isDemo={false}
      loading={isFetching}
      error={isError}
      errorMessage="تعذر تحميل الأدوار."
      onRetry={refetch}
    />
  );
};

export default RolesPage;
