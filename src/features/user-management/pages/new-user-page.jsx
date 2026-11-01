import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../shared/ui/breadcrumb';
import UserForm from '../components/user-form';
import { addDemoUser, getDemoUsers } from '../data/demo-users';
import { mockRoles } from '../data/mock-data';

const NewUserPage = () => {
  const navigate = useNavigate();

  const createUser = (values) => {
    const user = addDemoUser(values);
    navigate(`/users/${user.id}`, {
      replace: true,
      state: {
        notice: `تم إنشاء معاينة للمستخدم ${user.name}. لم تُحفظ البيانات على الخادم.`,
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb
        items={[
          { label: 'إدارة المستخدمين' },
          { label: 'المستخدمون', to: '/users' },
          { label: 'إضافة مستخدم جديد' },
        ]}
      />
      <UserForm
        users={getDemoUsers()}
        roles={mockRoles}
        onCancel={() => navigate('/users')}
        onSave={createUser}
      />
    </div>
  );
};

export default NewUserPage;
