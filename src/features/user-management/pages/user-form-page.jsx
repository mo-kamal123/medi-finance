import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../../shared/ui/breadcrumb';
import PageLoader from '../../../shared/ui/page-loader';
import { getRoles } from '../api/roles.api';
import { createUser, updateUser } from '../api/users.api';
import UserForm from '../components/user-form';
import UserPageHeader from '../components/user-page-header';
import { useUser } from '../hooks/users.queries';

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useUser(id);
  const roles = useQuery({
    queryKey: ['roles'],
    queryFn: ({ signal }) => getRoles(signal),
  });

  const save = async (values) => {
    if (id) await updateUser(id, values);
    else await createUser(values);

    void queryClient.invalidateQueries({ queryKey: ['users'] });
    navigate('/users', {
      replace: true,
      state: {
        notice: id ? 'تم تحديث بيانات المستخدم.' : 'تم إنشاء المستخدم.',
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb
        items={[
          { label: 'إدارة المستخدمين' },
          { label: 'المستخدمون', to: '/users' },
          { label: id ? 'تعديل المستخدم' : 'إضافة مستخدم جديد' },
        ]}
      />
      {user.isLoading || roles.isLoading ? (
        <PageLoader label="جاري تحميل بيانات المستخدم والأدوار..." />
      ) : (id && !user.data) || !roles.data ? (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          تعذر تحميل بيانات المستخدم أو الأدوار.
          <button
            type="button"
            className="mx-3 underline"
            onClick={() => {
              if (id && !user.data) void user.refetch();
              if (!roles.data) void roles.refetch();
            }}
          >
            إعادة المحاولة
          </button>
          <Link to="/users" className="underline">
            العودة إلى المستخدمين
          </Link>
        </div>
      ) : (
        <>
          <UserPageHeader user={user.data} />
          <UserForm
            key={id ?? 'new'}
            user={user.data}
            roles={roles.data}
            onSave={save}
          />
        </>
      )}
    </div>
  );
};

export default UserFormPage;
