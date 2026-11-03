import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  ListChecks,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../../shared/ui/breadcrumb';
import FormInput from '../../../shared/ui/input';
import PageLoader from '../../../shared/ui/page-loader';
import Toggle from '../../../shared/ui/toggle';
import { getPermissionModules, getRole, saveRole } from '../api/roles.api';
import StatusBadge from '../components/status-badge';

const tabs = [
  {
    id: 'info',
    label: 'بيانات الدور',
    icon: <FileText size={16} aria-hidden="true" />,
  },
  {
    id: 'permissions',
    label: 'الصلاحيات',
    icon: <ListChecks size={16} aria-hidden="true" />,
  },
];

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

const getPermissionCodes = ({ resources }) =>
  resources.flatMap(({ permissions }) => permissions.map(({ code }) => code));

const SelectAllPermissions = ({
  codes,
  label,
  selected,
  onChange,
  compact = false,
}) => {
  const allSelected =
    codes.length > 0 && codes.every((code) => selected.has(code));
  const partiallySelected =
    !allSelected && codes.some((code) => selected.has(code));

  return (
    <label
      className={
        compact
          ? 'grid size-10 cursor-pointer place-items-center'
          : 'flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700'
      }
    >
      <input
        type="checkbox"
        className="size-4 shrink-0 accent-primary"
        ref={(input) => {
          if (input) input.indeterminate = partiallySelected;
        }}
        checked={allSelected}
        disabled={!codes.length}
        onChange={(event) => onChange(codes, event.target.checked)}
      />
      <span className={compact ? 'sr-only' : undefined}>{label}</span>
    </label>
  );
};

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
  const [activeTab, setActiveTab] = useState('info');
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

  const selectPermissions = (codes, checked) => {
    setSelected((previous) => {
      const next = new Set(previous);
      for (const code of codes) {
        if (checked) next.add(code);
        else next.delete(code);
      }
      return next;
    });
  };

  const knownCodes = new Set(modules.flatMap(getPermissionCodes));
  const otherCodes = [...selected].filter((code) => !knownCodes.has(code));

  const submit = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    setNameError(!trimmedName);
    if (!trimmedName) {
      setActiveTab('info');
      return;
    }
    if (isPending) return;

    mutate({
      name: trimmedName,
      description: description.trim(),
      isActive,
      permissionCodes: [...selected],
    });
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-6">
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
      <fieldset
        disabled={isPending}
        className="min-w-0 rounded-xl border border-gray-200 bg-white"
      >
        <div
          role="tablist"
          aria-label="تفاصيل الدور"
          className="flex gap-1 overflow-x-auto border-b border-gray-200 px-4 pt-3"
        >
          {tabs.map(({ id: tab, label, icon }) => (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`role-tab-${tab}`}
              aria-selected={activeTab === tab}
              aria-controls={`role-panel-${tab}`}
              tabIndex={activeTab === tab ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              onKeyDown={(event) => {
                if (
                  !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(
                    event.key
                  )
                )
                  return;
                event.preventDefault();
                const nextTab =
                  event.key === 'Home'
                    ? 'info'
                    : event.key === 'End'
                      ? 'permissions'
                      : tab === 'info'
                        ? 'permissions'
                        : 'info';
                setActiveTab(nextTab);
                event.currentTarget.ownerDocument
                  .getElementById(`role-tab-${nextTab}`)
                  ?.focus();
              }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-base font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-primary bg-primary/5 text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
        <section
          role="tabpanel"
          id="role-panel-info"
          aria-labelledby="role-tab-info"
          hidden={activeTab !== 'info'}
          className="space-y-4 p-6"
        >
          <h2 id="role-details" className="text-lg font-semibold">
            بيانات الدور
          </h2>
          <FormInput
            label="اسم الدور"
            aria-label="اسم الدور"
            aria-invalid={nameError}
            error={
              nameError ? <span role="alert">أدخل اسم الدور.</span> : undefined
            }
            required
            maxLength={150}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (event.target.value.trim()) setNameError(false);
            }}
          />
          <FormInput
            as="textarea"
            label="الوصف"
            aria-label="الوصف"
            rows={3}
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <Toggle
            label="نشط"
            role="switch"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            disabled={isPending}
          />
        </section>
        <section
          role="tabpanel"
          id="role-panel-permissions"
          aria-labelledby="role-tab-permissions"
          hidden={activeTab !== 'permissions'}
          className="h-[clamp(12rem,50dvh,32rem)] min-w-0 space-y-3 overflow-y-auto overscroll-contain p-6"
        >
          <div
            dir="rtl"
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <h2 id="role-permissions" className="text-lg font-semibold">
              صلاحيات الدور
            </h2>
            <div className="ms-auto rounded-lg border border-gray-200 bg-primary/5">
              <SelectAllPermissions
                codes={[...knownCodes]}
                label="تحديد جميع الصلاحيات المتاحة"
                selected={selected}
                onChange={selectPermissions}
              />
            </div>
          </div>
          {!modules.length && (
            <p className="text-gray-600">لا توجد صلاحيات متاحة.</p>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[0, 1].map((column) => (
              <div
                key={column}
                className="contents md:flex md:min-w-0 md:flex-col md:gap-3"
              >
                {modules.map(
                  ({ module, resources }, index) =>
                    index % 2 === column && (
                      <div
                        key={module}
                        style={{ order: index }}
                        className="relative min-w-0"
                      >
                        <div className="absolute top-1 right-1 z-10">
                          <SelectAllPermissions
                            codes={getPermissionCodes({ resources })}
                            label={`تحديد جميع صلاحيات الوحدة ${module}`}
                            selected={selected}
                            onChange={selectPermissions}
                            compact
                          />
                        </div>
                        <details className="group h-fit min-w-0 rounded-xl border border-gray-200 bg-white">
                          <summary
                            className="flex cursor-pointer list-none items-center gap-3 rounded-xl bg-gray-50 py-3 pr-12 pl-4 text-right font-medium hover:bg-gray-100 [&::-webkit-details-marker]:hidden"
                            dir="rtl"
                          >
                            <bdi className="min-w-0 flex-1 break-words">
                              {module}
                            </bdi>
                            <ChevronDown
                              size={18}
                              className="shrink-0 text-gray-600 transition-transform group-open:rotate-180"
                              aria-hidden="true"
                            />
                          </summary>
                          {resources.map(
                            ({
                              resource,
                              displayNameAr,
                              displayName,
                              permissions,
                            }) => (
                              <fieldset
                                key={resource}
                                dir="rtl"
                                className="m-4 min-w-0 rounded-lg border border-gray-200"
                              >
                                <legend className="mx-3 px-2 text-sm font-semibold text-gray-700">
                                  <bdi>
                                    {displayNameAr || displayName || resource}
                                  </bdi>
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
                      </div>
                    )
                )}
              </div>
            ))}
          </div>
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
        <div className="sticky bottom-0 z-10 space-y-3 rounded-b-xl border-t border-gray-200 bg-white px-6 py-4">
          {isError && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">
              تعذر حفظ الدور. حاول مرة أخرى.
            </p>
          )}
          <div className="flex items-center justify-end gap-4">
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
