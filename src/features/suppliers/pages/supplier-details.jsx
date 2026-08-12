import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  HeartHandshake,
  MapPin,
  Percent,
  Phone,
  Settings,
  User,
  Users,
  Paperclip,
} from 'lucide-react';
import PageLoader from '../../../shared/ui/page-loader';
import NormalSelect from '../../../shared/ui/NormalSelect';
import { useSupplier } from '../hooks/suppliers.queries';
import {
  useNetworks,
  useOperationTypes,
  usePaymentStatuses
} from '../hooks/suppliers.queries';
import { useUpdateSupplierFinanceInfo } from '../hooks/suppliers.mutations';

const DISCOUNT_GROUP_LABELS = {
  generalHospitalServices: 'الخدمات العامة بالمستشفى',
  radiologyCenter: 'مركز الأشعة',
  chronicAndAcute: 'الأمراض المزمنة والحادة',
  otherServices: 'خدمات أخرى',
};

const DISCOUNT_SERVICE_LABELS = {
  Examination: 'كشف',
  Radiology: 'أشعة',
  Lab: 'معمل',
  'Physician Fee': 'أجور الأطباء',
  'Physical Therapy': 'علاج طبيعي',
  'Dental Services': 'خدمات الأسنان',
  'Obstetrics Services': 'خدمات الولادة',
  'Surgical Services': 'الخدمات الجراحية',
  Completion: 'استكمال',
  MRI: 'رنين مغناطيسي',
  'CT Scan': 'أشعة مقطعية',
  'Regular X-Ray': 'أشعة عادية',
  'With Contrast': 'بالصبغة',
  Doppler: 'دوبلر',
  'Dye Only': 'صبغة فقط',
  'Nuclear Scan': 'مسح نووي',
  'Chronic-Local': 'مزمن - محلي',
  'Chronic-Imported': 'مزمن - مستورد',
  'Acute-Local': 'حاد - محلي',
  'Acute-Imported': 'حاد - مستورد',
  'Outpatient Services': 'خدمات العيادات الخارجية',
  Ophthalmology: 'طب العيون',
  Unknown: 'أخرى',
};

const includeCurrentOption = (options, value, label) => {
  const current = value != null ? String(value) : '';
  if (!current) return options;
  if (options.some((option) => String(option.value) === current)) {
    return options;
  }
  return [{ value: current, label: label || current }, ...options];
};

const statusClass = (status) => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();
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

const ReadOnlyField = ({ label, value, className = '' }) => (
  <div className={className}>
    <label className="mb-1 block text-base font-medium text-gray-500">
      {label}
    </label>
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900">
      {value || <span className="text-gray-400">-</span>}
    </div>
  </div>
);

const BooleanField = ({ label, value }) => (
  <div>
    <label className="mb-1 block text-base font-medium text-gray-500">
      {label}
    </label>
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
  const color = statusClass(statusName);
  return (
    <div>
      <label className="mb-1 block text-base font-medium text-gray-500">
        الحالة
      </label>
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base">
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-medium ${color}`}
        >
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
  { key: 'discounts', label: 'الخصومات', icon: Percent },
  { key: 'medicardDiscounts', label: 'خصومات ميديكارد', icon: HeartHandshake },
  { key: 'settings', label: 'الإعدادات', icon: Settings },
  { key: 'system', label: 'معلومات النظام', icon: Calendar },
];

const SupplierDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: supplier, isLoading } = useSupplier(id);
  const { data: operationTypes = [] } = useOperationTypes();
  const { data: networks = [] } = useNetworks();
  const { data: paymentsStatuses = [] } = usePaymentStatuses();
  const updateFinanceInfoMutation = useUpdateSupplierFinanceInfo();
  const [activeTab, setActiveTab] = useState('basic');
  const [paymentStatusId, setPaymentStatusId] = useState('');
  const [operationType, setOperationType] = useState('');
  const [network, setNetwork] = useState('');

  const handleSaveFinanceInfo = () => {
    updateFinanceInfoMutation.mutate({
      id: Number(id),
      paymentStatusId: paymentStatusValue,
      operationType: operationTypeValue,
      network: networkValue,
    });
  };

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
  const discounts = supplier.discounts || {};
  const medicardDiscounts = supplier.medicardDiscounts || {};

  const paymentStatusValue =
    paymentStatusId ||
    (financeInfo.paymentStatusId != null
      ? String(financeInfo.paymentStatusId)
      : '');
  const paymentStatusOptions = includeCurrentOption(
    paymentsStatuses.map((status) => ({
      value: String(status.paymentStatusID ?? status.id ?? status.value ?? ''),
      label: status.nameAr || status.name || status.label || '',
    })),
    paymentStatusValue,
    (() => {
      const current = paymentsStatuses.find(
        (status) =>
          String(status.paymentStatusID ?? status.id ?? status.value ?? '') ===
          paymentStatusValue
      );
      return (current?.nameAr || current?.name) || paymentStatusValue;
    })()
  );
  const operationTypeValue =
    operationType ||
    (financeInfo.operationType != null
      ? String(financeInfo.operationType)
      : '');
  const operationTypeOptions = includeCurrentOption(
    operationTypes,
    operationTypeValue,
    operationTypeValue
  );

  const networkValue =
    network || (financeInfo.network != null ? String(financeInfo.network) : '');
  const networkOptions = includeCurrentOption(
    networks,
    networkValue,
    networkValue
  );

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
                <h1 className="text-2xl font-bold">
                  {basicInfo.providerNameAr}
                </h1>
                <p className="mt-0.5 text-white/70">
                  {basicInfo.providerNameEn}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/suppliers')}
              className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
            >
              العودة إلى الموردين
              <ArrowLeft size={16} />
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
              <ReadOnlyField
                label="الاسم بالعربي"
                value={basicInfo.providerNameAr}
              />
              <ReadOnlyField
                label="الاسم بالإنجليزي"
                value={basicInfo.providerNameEn}
              />
              <ReadOnlyField
                label="كود المورد"
                value={basicInfo.supplierCode}
              />
              <ReadOnlyField
                label="فئة المورد"
                value={basicInfo.providerClass}
              />
              <ReadOnlyField label="التصنيف" value={basicInfo.categoryName} />
              <ReadOnlyField
                label="التخصص العام"
                value={basicInfo.generalSpecialist}
              />
              <ReadOnlyField
                label="التخصص الفرعي"
                value={basicInfo.subSpecialist}
              />
              <StatusBadge statusName={basicInfo.status} />
              <ReadOnlyField
                label="مستوى الأهمية"
                value={basicInfo.importanceLevel}
              />
              <ReadOnlyField
                label="حالة المراجعة"
                value={basicInfo.reviewStatus}
              />
              <ReadOnlyField
                label="أيام الدفعة"
                value={basicInfo.batchDueDays}
              />
              <ReadOnlyField label="الخط الساخن" value={basicInfo.hotLine} />
              <ReadOnlyField
                label="محافظة المقر الرئيسي"
                value={basicInfo.headQuartersGovernorate}
              />
              <ReadOnlyField
                label="عنوان المقر الرئيسي"
                value={basicInfo.headQuarterAddress}
              />
              <ReadOnlyField
                label="الخصم المحلي"
                value={
                  basicInfo.localDiscount != null
                    ? `${basicInfo.localDiscount}%`
                    : null
                }
              />
              <ReadOnlyField
                label="الخصم المستورد"
                value={
                  basicInfo.importedDiscount != null
                    ? `${basicInfo.importedDiscount}%`
                    : null
                }
              />
              <BooleanField label="نشط" value={basicInfo.isActive} />
              <ReadOnlyField
                label="ملاحظات"
                value={basicInfo.notes}
                className="md:col-span-2"
              />
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-max min-w-full table-auto border-collapse text-sm">
                {' '}
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      #
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      الاسم
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      المحافظة
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      المدينة
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      المنطقة
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      العنوان
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      هاتف 1
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      موبايل 1
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      موبايل 2
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      خط العرض
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      خط الطول
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      رابط خرائط جوجل
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      كيلومتر
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      الحالة
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      محذوف
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        {loc.name || '-'}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        {loc.government || '-'}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        {loc.city || '-'}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        {loc.areaAr || '-'}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        {loc.addressAr || '-'}
                      </td>
                      <td
                        className="border border-gray-200 px-4 py-3"
                        dir="ltr"
                      >
                        {loc.telephone1 || '-'}
                      </td>
                      <td
                        className="border border-gray-200 px-4 py-3"
                        dir="ltr"
                      >
                        {loc.mobile1 || '-'}
                      </td>
                      <td
                        className="border border-gray-200 px-4 py-3"
                        dir="ltr"
                      >
                        {loc.mobile2 || '-'}
                      </td>
                      <td
                        className="border border-gray-200 px-4 py-3"
                        dir="ltr"
                      >
                        {loc.latitude || '-'}
                      </td>
                      <td
                        className="border border-gray-200 px-4 py-3"
                        dir="ltr"
                      >
                        {loc.longitude || '-'}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        {loc.googleMapsUrl || '-'}
                      </td>
                      <td
                        className="border border-gray-200 px-4 py-3"
                        dir="ltr"
                      >
                        {loc.kilo || '-'}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusClass(loc.status)}`}
                        >
                          {loc.status || '-'}
                        </span>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        {loc.deleted || '-'}
                      </td>
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
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      #
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      الاسم
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      المسمى الوظيفي
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      البريد الإلكتروني
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      الموبايل
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      ملاحظات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="border border-gray-200 px-4 py-8 text-center text-gray-400"
                      >
                        لا توجد جهات اتصال
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 text-gray-500">
                          {idx + 1}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {contact.name || '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {contact.jobTitle || '-'}
                        </td>
                        <td
                          className="border border-gray-200 px-4 py-3"
                          dir="ltr"
                        >
                          {contact.email || '-'}
                        </td>
                        <td
                          className="border border-gray-200 px-4 py-3"
                          dir="ltr"
                        >
                          {contact.mobile || '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {contact.notes || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
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
                    financeInfo.taxes != null ? `${financeInfo.taxes}%` : null
                  }
                />
                <ReadOnlyField
                  label="تاريخ مستند الضريبة المسبقة"
                  value={financeInfo.taxAdvanceDocumentDate}
                />
                <ReadOnlyField label="السجل" value={financeInfo.record} />
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="mb-4 text-base font-semibold text-gray-700">
                  البيانات القابلة للتعديل
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
                  <NormalSelect
                    label="حالة الدفع"
                    value={paymentStatusValue}
                    onChange={(e) => setPaymentStatusId(e.target.value)}
                    options={paymentStatusOptions}
                    disabled={updateFinanceInfoMutation.isPending}
                  />
                  <NormalSelect
                    label="نوع العملية"
                    value={operationTypeValue}
                    onChange={(e) => setOperationType(e.target.value)}
                    options={operationTypeOptions}
                    disabled={updateFinanceInfoMutation.isPending}
                  />
                  <NormalSelect
                    label="الشبكة"
                    value={networkValue}
                    onChange={(e) => setNetwork(e.target.value)}
                    options={networkOptions}
                    disabled={updateFinanceInfoMutation.isPending}
                  />
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveFinanceInfo}
                    disabled={updateFinanceInfoMutation.isPending}
                    className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updateFinanceInfoMutation.isPending
                      ? 'جاري الحفظ...'
                      : 'حفظ البيانات'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'programs' && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      #
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      اسم البرنامج
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      البرنامج
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allowedPrograms.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="border border-gray-200 px-4 py-8 text-center text-gray-400"
                      >
                        لا توجد برامج مسموح بها
                      </td>
                    </tr>
                  ) : (
                    allowedPrograms.map((prog, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 text-gray-500">
                          {idx + 1}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {prog.name || '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {prog.program || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      #
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      اسم الملف
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      حجم الملف
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      تاريخ الرفع
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attachments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="border border-gray-200 px-4 py-8 text-center text-gray-400"
                      >
                        لا توجد مرفقات
                      </td>
                    </tr>
                  ) : (
                    attachments.map((file, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 text-gray-500">
                          {idx + 1}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {file.fileName || '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {file.fileSize != null ? `${file.fileSize} KB` : '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {file.uploadDate || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'discounts' && (
            <div className="space-y-6">
              {Object.keys(discounts).length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  لا توجد خصومات
                </div>
              ) : (
                Object.entries(discounts).map(([groupKey, services]) => (
                  <div
                    key={groupKey}
                    className="overflow-hidden rounded-lg border border-gray-200"
                  >
                    <div className="border-b border-gray-200 bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700">
                      {DISCOUNT_GROUP_LABELS[groupKey] || groupKey}
                    </div>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(services).map(([service, value]) => (
                        <ReadOnlyField
                          key={service}
                          label={DISCOUNT_SERVICE_LABELS[service] || service}
                          value={value != null ? `${value}%` : null}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'medicardDiscounts' && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.keys(medicardDiscounts).length === 0 ? (
                <div className="py-8 text-center text-gray-500 sm:col-span-2 lg:col-span-3">
                  لا توجد خصومات ميديكارد
                </div>
              ) : (
                Object.entries(medicardDiscounts).map(([service, value]) => (
                  <ReadOnlyField
                    key={service}
                    label={service}
                    value={value != null ? `${value}%` : null}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <BooleanField
                label="Allow Chronic On Portal"
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
                <ReadOnlyField
                  label="شعار المورد"
                  value={basicInfo.providerLogo}
                  className="md:col-span-2"
                />
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
