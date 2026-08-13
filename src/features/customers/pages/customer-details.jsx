import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Users,
  GitBranch,
} from 'lucide-react';
import PageLoader from '../../../shared/ui/page-loader';
import Pagination from '../../../shared/ui/pagination';
import Breadcrumb from '../../../shared/ui/breadcrumb';
import { useCustomer } from '../hooks/customers.queries';

const ReadOnlyField = ({ label, value, className = '' }) => (
  <div className={className}>
    <label className="mb-1 block text-base font-medium text-gray-500">{label}</label>
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900">
      {value || <span className="text-gray-400">-</span>}
    </div>
  </div>
);

const statusClass = (statusName) => {
  const normalized = String(statusName || '').trim().toLowerCase();
  if (normalized.startsWith('deactiv') || normalized.includes('inactiv')) {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  if (normalized.startsWith('activ') || normalized === 'active') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
  if (normalized === 'hold') {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const StatusBadge = ({ statusName }) => (
  <div>
    <label className="mb-1 block text-base font-medium text-gray-500">الحالة</label>
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base">
      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-medium ${statusClass(statusName)}`}>
        {statusName || '-'}
      </span>
    </div>
  </div>
);

const TABS = [
  { key: 'basic', label: 'المعلومات الأساسية', icon: Building2 },
  { key: 'contacts', label: 'جهات الاتصال', icon: Users },
  { key: 'branches', label: 'الفروع', icon: GitBranch },
];

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: customer, isLoading } = useCustomer(id);
  const [activeTab, setActiveTab] = useState('basic');
  const [contactsPage, setContactsPage] = useState(1);
  const [branchesPage, setBranchesPage] = useState(1);
  const [contactsPageSize, setContactsPageSize] = useState(5);
  const [branchesPageSize, setBranchesPageSize] = useState(5);

  if (isLoading) return <PageLoader label="جاري تحميل بيانات العميل..." />;
  if (!customer) {
    return (
      <div className="p-6 text-center text-gray-500">العميل غير موجود</div>
    );
  }

  const contacts = customer.contacts || [];
  const branches = customer.branches || [];

  const contactsTotalPages = Math.max(Math.ceil(contacts.length / contactsPageSize), 1);
  const branchesTotalPages = Math.max(Math.ceil(branches.length / branchesPageSize), 1);
  const visibleContacts = contacts.slice(
    (contactsPage - 1) * contactsPageSize,
    contactsPage * contactsPageSize,
  );
  const visibleBranches = branches.slice(
    (branchesPage - 1) * branchesPageSize,
    branchesPage * branchesPageSize,
  );

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb
        items={[
          { label: 'العملاء', to: '/customers' },
          { label: customer.clientName || 'تفاصيل العميل' },
        ]}
      />
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="bg-linear-to-r from-primary to-primary/80 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
                <span className="text-2xl font-bold">
                  {customer.clientName?.[0]}
                </span>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{customer.clientName}</h1>
                <p className="mt-0.5 text-white/70">
                  {customer.accountCode || `كود العميل: ${customer.customerID}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/customers')}
              className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-white/30"
            >
              العودة إلى العملاء
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-4 pt-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-base font-medium transition-colors ${
                  isActive
                    ? 'border-b-2 border-primary bg-primary/5 text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <ReadOnlyField label="كود العميل" value={customer.customerID} />
              <ReadOnlyField label="اسم العميل" value={customer.clientName} />
              <ReadOnlyField label="كود الحساب" value={customer.accountCode} />
              <ReadOnlyField label="اسم الحساب" value={customer.accountNameAr} />
              <ReadOnlyField label="أيام التعويض" value={customer.reimbursementDueDays} />
              <ReadOnlyField label="تصنيف العميل" value={customer.clientCategory} />
              <ReadOnlyField label="نوع العميل" value={customer.clientType} />
              <StatusBadge statusName={customer.status} />
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full border-collapse text-base">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="border border-gray-200 px-4 py-3 text-right font-semibold">#</th>
                      <th className="border border-gray-200 px-4 py-3 text-right font-semibold">الاسم</th>
                      <th className="border border-gray-200 px-4 py-3 text-right font-semibold">المسمى الوظيفي</th>
                      <th className="border border-gray-200 px-4 py-3 text-right font-semibold">البريد الإلكتروني</th>
                      <th className="border border-gray-200 px-4 py-3 text-right font-semibold">الموبايل</th>
                      <th className="border border-gray-200 px-4 py-3 text-right font-semibold">العنوان</th>
                      <th className="border border-gray-200 px-4 py-3 text-right font-semibold">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="border border-gray-200 px-4 py-8 text-center text-gray-400">
                          لا توجد جهات اتصال
                        </td>
                      </tr>
                    ) : (
                      visibleContacts.map((contact, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-3 text-gray-500">
                            {(contactsPage - 1) * contactsPageSize + idx + 1}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">{contact.name || '-'}</td>
                          <td className="border border-gray-200 px-4 py-3">{contact.jobTitle || '-'}</td>
                          <td className="border border-gray-200 px-4 py-3" dir="ltr">{contact.email || '-'}</td>
                          <td className="border border-gray-200 px-4 py-3" dir="ltr">{contact.mobile || '-'}</td>
                          <td className="border border-gray-200 px-4 py-3">{contact.address || '-'}</td>
                          <td className="border border-gray-200 px-4 py-3">{contact.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={contactsPage}
                totalPages={contactsTotalPages}
                pageSize={contactsPageSize}
                onPageChange={setContactsPage}
                onPageSizeChange={(size) => {
                  setContactsPageSize(size);
                  setContactsPage(1);
                }}
              />
            </div>
          )}

          {activeTab === 'branches' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full border-collapse text-base">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="border border-gray-200 px-4 py-3 text-right font-semibold">#</th>
                      <th className="border border-gray-200 px-4 py-3 text-right font-semibold">اسم الفرع</th>
                      <th className="border border-gray-200 px-4 py-3 text-right font-semibold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="border border-gray-200 px-4 py-8 text-center text-gray-400">
                          لا توجد فروع
                        </td>
                      </tr>
                    ) : (
                      visibleBranches.map((branch, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-3 text-gray-500">
                            {(branchesPage - 1) * branchesPageSize + idx + 1}
                          </td>
                          <td className="border border-gray-200 px-4 py-3">{branch.branchName || '-'}</td>
                          <td className="border border-gray-200 px-4 py-3">
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-sm font-medium ${statusClass(branch.branchStatus)}`}>
                              {branch.branchStatus || '-'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={branchesPage}
                totalPages={branchesTotalPages}
                pageSize={branchesPageSize}
                onPageChange={setBranchesPage}
                onPageSizeChange={(size) => {
                  setBranchesPageSize(size);
                  setBranchesPage(1);
                }}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
