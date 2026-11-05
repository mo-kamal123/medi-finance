import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import ManagementTablePage from '../components/management-table-page';
import StatusBadge from '../components/status-badge';
import { useUsers } from '../hooks/users.queries';
import { formatDate } from '../../../shared/utils/formatters';

const columns = [
  { header: 'الكود', key: 'id' },
  {
    header: 'الاسم',
    key: 'name',
    type: 'custom',
    render: (row) => (
      <Link
        to={`/users/${encodeURIComponent(row.id)}`}
        className="text-primary hover:underline"
      >
        {row.name}
      </Link>
    ),
  },
  {
    header: 'رقم الهاتف',
    key: 'mobileNumber',
    type: 'custom',
    render: (row) => <span dir="ltr">{row.mobileNumber}</span>,
  },
  {
    header: 'الأدوار',
    key: 'roles',
    type: 'custom',
    render: (row) => (
      <div className="flex flex-wrap gap-1.5">
        {(row.roles ?? []).map((role) => (
          <span
            key={role}
            dir="auto"
            className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
          >
            {role}
          </span>
        ))}
      </div>
    ),
  },
  {
    header: 'الحالة',
    key: 'status',
    type: 'custom',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    header: 'تاريخ الإنشاء',
    key: 'createdAt',
    type: 'custom',
    render: (row) => formatDate(row.createdAt),
  },
  {
    header: 'آخر تحديث',
    key: 'updatedAt',
    type: 'custom',
    render: (row) => formatDate(row.updatedAt),
  },
];

const UsersPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const notice = state?.notice;
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters(filters);
      setPageNumber(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);
  const {
    data: response,
    isFetching,
    isError,
    refetch,
  } = useUsers({
    pageNumber,
    pageSize,
    searchTerm: appliedFilters.search.trim() || undefined,
    isActive: appliedFilters.status
      ? appliedFilters.status === 'active'
      : undefined,
  });

  return (
    <>
      {notice && (
        <p
          role="status"
          className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800"
        >
          {notice}
        </p>
      )}
      <ManagementTablePage
        title="المستخدمون"
        headerIcon={<Users size={20} />}
        description="عرض المستخدمين وبيانات حساباتهم"
        data={response?.items ?? []}
        isDemo={false}
        loading={isFetching}
        error={isError}
        onRetry={refetch}
        serverFilters={{ ...filters, onChange: setFilters }}
        serverPagination={{
          pageNumber: response?.pageNumber ?? pageNumber,
          pageSize,
          totalPages: response?.totalPages ?? pageNumber,
          totalCount: response?.totalCount ?? 0,
          onPageChange: setPageNumber,
          onPageSizeChange: (value) => {
            setPageSize(value);
            setPageNumber(1);
          },
        }}
        onRowClick={(user) => navigate(`/users/${encodeURIComponent(user.id)}`)}
        headerAction={
          <Link
            to="/users/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            <Plus size={18} />
            إضافة مستخدم جديد
          </Link>
        }
        columns={columns}
        searchKeys={['id', 'name', 'mobileNumber', 'roles']}
        searchPlaceholder="ابحث بالاسم أو رقم الهاتف أو الدور"
      />
    </>
  );
};

export default UsersPage;
