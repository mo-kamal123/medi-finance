import ManagementTablePage from '../components/management-table-page';
import StatusBadge from '../components/status-badge';
import { mockRoles, mockUsers } from '../data/mock-data';

const roles = mockRoles.map((role) => ({
  ...role,
  userCount: mockUsers.filter((user) => user.roleId === role.id).length,
}));

const columns = [
  { header: 'الدور', key: 'name' },
  { header: 'الوصف', key: 'description' },
  { header: 'الصلاحيات', key: 'permissions' },
  { header: 'عدد المستخدمين', key: 'userCount' },
  {
    header: 'الحالة',
    key: 'status',
    type: 'custom',
    render: (row) => <StatusBadge status={row.status} />,
  },
];

const RolesPage = () => (
  <ManagementTablePage
    title="الأدوار"
    description="عرض أدوار المستخدمين والصلاحيات المرتبطة بكل دور"
    data={roles}
    columns={columns}
    searchKeys={['name', 'description', 'permissions']}
    searchPlaceholder="ابحث باسم الدور أو الصلاحيات"
  />
);

export default RolesPage;
