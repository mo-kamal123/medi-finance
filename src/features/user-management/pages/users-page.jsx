import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
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
  { header: 'اسم المستخدم', key: 'username' },
  {
    header: 'البريد الإلكتروني',
    key: 'email',
    type: 'custom',
    render: (row) => <span dir="ltr">{row.email}</span>,
  },
  { header: 'كود الموظف', key: 'employeeCode' },
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
  const {
    data: response,
    isFetching,
    isError,
    refetch,
  } = useUsers({ pageNumber, pageSize });

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
        description="عرض المستخدمين وبيانات حساباتهم"
        data={response?.items ?? []}
        isDemo={false}
        loading={isFetching}
        error={isError}
        onRetry={refetch}
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
        searchKeys={['id', 'name', 'username', 'email', 'employeeCode']}
        searchPlaceholder="ابحث بالاسم أو البريد أو اسم المستخدم"
      />
    </>
  );
};

export default UsersPage;
import { useState } from 'react';
