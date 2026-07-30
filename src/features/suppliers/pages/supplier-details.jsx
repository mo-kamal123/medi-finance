import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  MapPin,
  Phone,
  Settings,
  User,
  Users,
  Paperclip,
} from 'lucide-react';
import PageLoader from '../../../shared/ui/page-loader';
import { useSupplier } from '../hooks/suppliers.queries';

const ReadOnlyField = ({ label, value, className = '' }) => (
  <div className={className}>
    <label className="mb-1 block text-base font-medium text-gray-500">{label}</label>
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900">
      {value || <span className="text-gray-400">-</span>}
    </div>
  </div>
);

const BooleanField = ({ label, value }) => (
  <div>
    <label className="mb-1 block text-base font-medium text-gray-500">{label}</label>
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base">
      {value ? (
        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          نعم
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 font-medium text-gray-400">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
          لا
        </span>
      )}
    </div>
  </div>
);

const StatusBadge = ({ statusName }) => {
  const colors = {
    Activated: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Deactivated: 'bg-red-100 text-red-700 border-red-200',
    Hold: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  const color = colors[statusName] || 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <div>
      <label className="mb-1 block text-base font-medium text-gray-500">الحالة</label>
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base">
        <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-medium ${color}`}>
          {statusName || '-'}
        </span>
      </div>
    </div>
  );
};

const TABS = [
  { key: 'basic', label: 'المعلومات الأساسية', icon: Building2 },
  { key: 'locations', label: 'المواقع', icon: MapPin },
  { key: 'contacts', label: 'جهات الاتصال', icon: Users },
  { key: 'financial', label: 'المعلومات المالية', icon: CreditCard },
  { key: 'programs', label: 'البرامج المسموح بها', icon: FileText },
  { key: 'attachments', label: 'المرفقات', icon: Paperclip },
  { key: 'settings', label: 'الإعدادات', icon: Settings },
  { key: 'system', label: 'معلومات النظام', icon: Calendar },
];

const SupplierDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: supplier, isLoading } = useSupplier(id);
  const [activeTab, setActiveTab] = useState('basic');

  if (isLoading) return <PageLoader label="جاري تحميل بيانات المورد..." />;
  if (!supplier) {
    return (
      <div className="p-6 text-center text-gray-500">المورد غير موجود</div>
    );
  }

  const basicInfo = supplier.basicInfo || {};
  const locations = supplier.locations || [];
  const contacts = supplier.contacts || [];
  const financeInfo = supplier.financeInfo || {};
  const allowedPrograms = supplier.allowedPrograms || [];
  const attachments = supplier.attachments || [];

  const visibleTabs = TABS;

  return (
    <div className="space-y-6 p-6">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
                <span className="text-2xl font-bold">
                  {basicInfo.providerNameAr?.[0]}
                </span>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{basicInfo.providerNameAr}</h1>
                <p className="mt-0.5 text-white/70">{basicInfo.providerNameEn}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/suppliers')}
              className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
            >
              <ArrowLeft size={16} />
              العودة إلى الموردين
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-4 pt-3">
          {visibleTabs.map((tab) => {
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
              <ReadOnlyField label="الاسم بالعربي" value={basicInfo.providerNameAr} />
              <ReadOnlyField label="الاسم بالإنجليزي" value={basicInfo.providerNameEn} />
              <ReadOnlyField label="فئة المورد" value={basicInfo.className} />
              <ReadOnlyField label="التصنيف" value={basicInfo.categoryName} />
              <ReadOnlyField label="التخصص العام" value={basicInfo.generalSpecialist} />
              <ReadOnlyField label="التخصص الفرعي" value={basicInfo.subSpecialist} />
              <StatusBadge statusName={basicInfo.statusName} />
              <ReadOnlyField label="أيام الدفعة" value={basicInfo.batchDueDays} />
              <ReadOnlyField label="الخط الساخن" value={basicInfo.hotLine} />
              <ReadOnlyField label="مستوى الأهمية" value={basicInfo.importanceLevel} />
              <ReadOnlyField label="حالة المراجعة" value={basicInfo.reviewStatus} />
              <ReadOnlyField label="ملاحظات" value={basicInfo.notes} className="md:col-span-2" />
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">#</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">الاسم</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">المحافظة</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">المدينة</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">المنطقة</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">العنوان</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">هاتف 1</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">موبايل 1</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">موبايل 2</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">خط العرض</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">خط الطول</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">رابط خرائط جوجل</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">كيلومتر</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">الحالة</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">محذوف</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="border border-gray-200 px-4 py-3">{loc.name || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3">{loc.government || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3">{loc.city || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3">{loc.areaAr || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3">{loc.addressAr || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3" dir="ltr">{loc.telephone1 || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3" dir="ltr">{loc.mobile1 || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3" dir="ltr">{loc.mobile2 || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3" dir="ltr">{loc.latitude || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3" dir="ltr">{loc.longitude || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3">{loc.googleMapsUrl || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3" dir="ltr">{loc.kilo || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                          loc.status === 'Activated'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                          {loc.status || '-'}
                        </span>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">{loc.deleted || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">#</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">الاسم</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">المسمى الوظيفي</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">البريد الإلكتروني</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">الموبايل</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="border border-gray-200 px-4 py-3">{contact.name || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3">{contact.jobTitle || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3" dir="ltr">{contact.email || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3" dir="ltr">{contact.mobile || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3">{contact.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <ReadOnlyField
                label="السجل التجاري"
                value={financeInfo.commercialRegistrationNumber}
              />
              <ReadOnlyField label="رقم VAT" value={financeInfo.vatNumber} />
              <ReadOnlyField
                label="نسبة رسوم الإدارة"
                value={
                  financeInfo.adminFees != null
                    ? `${financeInfo.adminFees}%`
                    : null
                }
              />
              <ReadOnlyField
                label="نسبة الضريبة"
                value={
                  financeInfo.taxes != null
                    ? `${financeInfo.taxes}%`
                    : null
                }
              />
              <ReadOnlyField
                label="تاريخ مستند الضريبة المسبقة"
                value={financeInfo.taxAdvanceDocumentDate}
              />
            </div>
          )}

          {activeTab === 'programs' && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">#</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">اسم البرنامج</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">البرنامج</th>
                  </tr>
                </thead>
                <tbody>
                  {allowedPrograms.map((prog, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="border border-gray-200 px-4 py-3">{prog.name || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3">{prog.program || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">#</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">اسم الملف</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">حجم الملف</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">تاريخ الرفع</th>
                  </tr>
                </thead>
                <tbody>
                  {attachments.map((file, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="border border-gray-200 px-4 py-3">{file.fileName || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3">{file.fileSize || '-'}</td>
                      <td className="border border-gray-200 px-4 py-3">{file.uploadDate || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <BooleanField
                label="السماح بالصورون المزمن على البوابة"
                value={basicInfo.allowChronicOnPortal}
              />
              <BooleanField
                label="يعمل مع ميديكارد"
                value={basicInfo.providerWorkWithMedicard}
              />
              <BooleanField
                label="عقد ميديكارد متاح"
                value={basicInfo.medicardContractAvailable}
              />
              <BooleanField
                label="مورد ميديكارد"
                value={basicInfo.medicardProvider}
              />
              {basicInfo.providerLogo && (
                <ReadOnlyField label="شعار المورد" value={basicInfo.providerLogo} className="md:col-span-2" />
              )}
            </div>
          )}

          {activeTab === 'system' && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <ReadOnlyField
                label="تاريخ الإنشاء"
                value={
                  supplier.createdAt
                    ? new Date(supplier.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : null
                }
              />
              <ReadOnlyField label="إنشاء بواسطة" value={supplier.createdBy} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDetails;
