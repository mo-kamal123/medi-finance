import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, Layers, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../../shared/ui/breadcrumb';
import PageLoader from '../../../shared/ui/page-loader';
import { getPermissionModules, getRole, saveRole } from '../api/roles.api';
import StatusBadge from '../components/status-badge';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const PermissionCheckbox = ({ code, label, selected, onToggle }) => (
  <label className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-primary/5 has-checked:bg-primary/5">
    <input
      type="checkbox"
      className="size-4 shrink-0 accent-primary"
      checked={selected.has(code)}
      onChange={() => onToggle(code)}
    />
    <span dir="auto">{label}</span>
  </label>
);

const RoleForm = ({ id, role, modules }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [isActive, setIsActive] = useState(role?.isActive ?? true);
  const [selected, setSelected] = useState(
    () => new Set(role?.permissionCodes)
  );
  const [nameError, setNameError] = useState(false);
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (values) => saveRole(id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['roles'], exact: true });
      navigate('/roles', { replace: true });
    },
  });

  const toggle = (code) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const knownCodes = new Set(
    modules.flatMap(({ resources }) =>
      resources.flatMap(({ permissions }) =>
        permissions.map(({ code }) => code)
      )
    )
  );
  const otherCodes = [...selected].filter((code) => !knownCodes.has(code));

  const submit = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    setNameError(!trimmedName);
    if (!trimmedName || isPending) return;

    mutate({
      name: trimmedName,
      description: description.trim(),
      isActive,
      permissionCodes: [...selected],
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-primary to-primary/80 p-6 text-white sm:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white/20">
            <ShieldCheck size={26} aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <h1 dir="auto" className="break-words text-2xl font-bold">
              {name.trim() || 'دور جديد'}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={isActive ? 'active' : 'inactive'} />
              {role && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                  {role.isSystemRole ? 'دور نظام' : 'دور مخصص'}
                </span>
              )}
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                الصلاحيات المحددة: {selected.size}
              </span>
            </div>
          </div>
        </div>
        <Link
          to="/roles"
          className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 font-medium hover:bg-white/30"
        >
          العودة إلى الأدوار
          <ArrowLeft size={16} aria-hidden="true" />
        </Link>
      </header>
      <fieldset disabled={isPending} className="min-w-0 space-y-6">
        <section
          aria-labelledby="role-details"
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-5"
        >
          <h2 id="role-details" className="text-lg font-semibold">
            بيانات الدور
          </h2>
          <label className="block space-y-1">
            <span>اسم الدور</span>
            <input
              className={inputClass}
              required
              maxLength={150}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          {nameError && (
            <p role="alert" className="text-red-700">
              أدخل اسم الدور.
            </p>
          )}
          <label className="block space-y-1">
            <span>الوصف</span>
            <textarea
              className={inputClass}
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            <span>نشط</span>
          </label>
        </section>
        <section
          aria-labelledby="role-permissions"
          className="min-w-0 space-y-3 rounded-xl border border-gray-200 bg-white p-5"
        >
          <h2 id="role-permissions" className="text-lg font-semibold">
            صلاحيات الدور
          </h2>
          <p className="text-sm text-gray-600">
            افتح الوحدة واختر الصلاحيات التي تريد إسنادها للدور.
          </p>
          {!modules.length && (
            <p className="text-gray-600">لا توجد صلاحيات متاحة.</p>
          )}
          {modules.map(({ module, resources }) => (
            <details
              key={module}
              className="group rounded-xl border border-gray-200 bg-white"
            >
              <summary
                className="flex cursor-pointer list-none items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-right font-medium hover:bg-gray-100 [&::-webkit-details-marker]:hidden"
                dir="rtl"
              >
                <Layers
                  size={18}
                  className="shrink-0 text-primary"
                  aria-hidden="true"
                />
                <bdi className="min-w-0 flex-1 break-words">{module}</bdi>
                <ChevronDown
                  size={18}
                  className="shrink-0 text-gray-600 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              {resources.map(
                ({ resource, displayNameAr, displayName, permissions }) => (
                  <fieldset
                    key={resource}
                    dir="rtl"
                    className="m-4 min-w-0 rounded-lg border border-gray-200"
                  >
                    <legend className="mx-3 px-2 text-sm font-semibold text-gray-700">
                      <bdi>{displayNameAr || displayName || resource}</bdi>
                    </legend>
                    <div className="divide-y divide-gray-100">
                      {permissions.map((permission) => (
                        <PermissionCheckbox
                          key={permission.code}
                          code={permission.code}
                          label={
                            permission.displayNameAr ||
                            permission.displayName ||
                            permission.code
                          }
                          selected={selected}
                          onToggle={toggle}
                        />
                      ))}
                    </div>
                  </fieldset>
                )
              )}
            </details>
          ))}
          {otherCodes.length > 0 && (
            <fieldset className="space-y-2 rounded-lg border border-gray-200 p-3">
              <legend className="px-1">صلاحيات أخرى مرتبطة بالدور</legend>
              {otherCodes.map((code) => (
                <PermissionCheckbox
                  key={code}
                  code={code}
                  label={code}
                  selected={selected}
                  onToggle={toggle}
                />
              ))}
            </fieldset>
          )}
        </section>
        {isError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">
            تعذر حفظ الدور. حاول مرة أخرى.
          </p>
        )}
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50"
          >
            {isPending ? 'جاري الحفظ...' : 'حفظ الدور'}
          </button>
          <Link to="/roles" className="text-primary hover:underline">
            إلغاء
          </Link>
        </div>
      </fieldset>
    </form>
  );
};

const RoleFormPage = () => {
  const { id } = useParams();
  const title = id ? 'تعديل الدور' : 'إضافة دور جديد';
  const role = useQuery({
    queryKey: ['roles', 'detail', id],
    queryFn: ({ signal }) => getRole(id, signal),
    enabled: Boolean(id),
    gcTime: 0,
    staleTime: Infinity,
  });
  const modules = useQuery({
    queryKey: ['permissions', 'modules'],
    queryFn: ({ signal }) => getPermissionModules(signal),
  });

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'إدارة المستخدمين' },
          { label: 'الأدوار', to: '/roles' },
          { label: title },
        ]}
      />
      {role.isError || modules.isError ? (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          تعذر تحميل بيانات الدور أو الصلاحيات.
          <button
            type="button"
            className="mx-3 underline"
            onClick={() => {
              if (role.isError) void role.refetch();
              if (modules.isError) void modules.refetch();
            }}
          >
            إعادة المحاولة
          </button>
          <Link to="/roles" className="underline">
            العودة إلى الأدوار
          </Link>
        </div>
      ) : role.isLoading || modules.isLoading ? (
        <PageLoader label="جاري تحميل بيانات الدور والصلاحيات..." />
      ) : (
        <RoleForm
          key={id ?? 'new'}
          id={id}
          role={role.data}
          modules={modules.data}
        />
      )}
    </div>
  );
};

export default RoleFormPage;
