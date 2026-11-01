import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../../shared/ui/breadcrumb';
import UserForm from '../components/user-form';
import UserPageHeader from '../components/user-page-header';
import { getDemoUsers, updateDemoUser } from '../data/demo-users';
import { mockRoles } from '../data/mock-data';
import { useUser } from '../hooks/users.queries';
import PageLoader from '../../../shared/ui/page-loader';
import UserDetails from '../components/user-details';

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const users = getDemoUsers();
  const isDemo = id.startsWith('USR-');
  const { data: apiUser, isLoading, isError, refetch } = useUser(id);
  const user = isDemo ? users.find((item) => item.id === id) : apiUser;

  if (!isDemo && isLoading)
    return <PageLoader label="جاري تحميل بيانات المستخدم..." />;
  if (!isDemo && isError)
    return (
      <div role="alert" className="rounded-xl bg-red-50 p-6 text-red-700">
        تعذر تحميل بيانات المستخدم.
        <button
          type="button"
          onClick={() => refetch()}
          className="mx-3 underline"
        >
          إعادة المحاولة
        </button>
        <Link to="/users" className="underline">
          العودة إلى المستخدمين
        </Link>
      </div>
    );

  if (!user) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold">المستخدم غير موجود</h1>
        <Link to="/users" className="text-primary hover:underline">
          العودة إلى المستخدمين
        </Link>
      </div>
    );
  }

  const saveUser = (values) => {
    updateDemoUser(user.id, values);
    navigate('/users', {
      replace: true,
      state: {
        notice: `تم تحديث بيانات ${values.name} في القائمة التجريبية. لن تُحفظ التغييرات بعد إعادة تحميل التطبيق.`,
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb
        items={[
          { label: 'إدارة المستخدمين' },
          { label: 'المستخدمون', to: '/users' },
          { label: user.name },
        ]}
      />
      <UserPageHeader user={user} roles={mockRoles} />
      {isDemo ? <UserForm
        key={user.id}
        users={users}
        roles={mockRoles}
        user={user}
        readOnly={!isDemo}
        onCancel={() => navigate('/users')}
        onSave={saveUser}
      /> : <UserDetails user={user} />}
    </div>
  );
};

export default EditUserPage;
