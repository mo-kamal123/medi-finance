import ManagementTablePage from '../components/management-table-page';
import StatusBadge from '../components/status-badge';
import { mockRoles, mockUsers } from '../data/mock-data';
import { formatDate } from '../../../shared/utils/formatters';

const users = mockUsers.map((user) => ({
  ...user,
  roleName: mockRoles.find((role) => role.id === user.roleId)?.name ?? '—',
}));

const columns = [
  { header: 'الكود', key: 'id' },
  { header: 'الاسم', key: 'name' },
  { header: 'اسم المستخدم', key: 'username' },
  {
    header: 'البريد الإلكتروني',
    key: 'email',
    type: 'custom',
    render: (row) => <span dir="ltr">{row.email}</span>,
  },
  { header: 'الدور', key: 'roleName' },
  {
    header: 'الحالة',
    key: 'status',
    type: 'custom',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    header: 'آخر تسجيل دخول',
    key: 'lastLogin',
    type: 'custom',
    render: (row) =>
      row.lastLogin ? formatDate(row.lastLogin) : 'لم يسجل الدخول',
  },
];

const UsersPage = () => (
  <ManagementTablePage
    title="المستخدمون"
    description="عرض المستخدمين والأدوار المسندة إليهم وحالة حساباتهم"
    data={users}
    columns={columns}
    searchKeys={['id', 'name', 'username', 'email', 'roleName']}
    searchPlaceholder="ابحث بالاسم أو البريد أو اسم المستخدم"
    roleOptions={mockRoles.map((role) => ({
      value: role.id,
      label: role.name,
    }))}
  />
);

export default UsersPage;
