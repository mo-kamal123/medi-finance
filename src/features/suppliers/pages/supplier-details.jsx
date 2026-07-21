import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Building2,
  CreditCard,
  FileText,
} from 'lucide-react';
import PageLoader from '../../../shared/ui/page-loader';
import { useSupplier } from '../hooks/suppliers.queries';

const Section = ({ icon: Icon, title, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
      {Icon && <Icon size={20} className="text-primary" />}
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, value }) => (
  <div>
    <span className="text-base text-gray-500 font-medium">{label}</span>
    <p className="text-xl font-bold text-gray-900 mt-1">{value ?? '-'}</p>
  </div>
);

const SupplierDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: supplier, isLoading } = useSupplier(id);

  if (isLoading) return <PageLoader label="جاري تحميل بيانات المورد..." />;
  if (!supplier)
    return (
      <div className="p-6 text-center text-gray-500">المورد غير موجود</div>
    );

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
                <span className="text-2xl font-bold">
                  {supplier.supplierNameAr?.[0]}
                </span>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">
                  {supplier.supplierNameAr}
                </h1>
                <p className="text-white/70 mt-0.5">{supplier.supplierCode}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/suppliers')}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} />
              العودة إلى الموردين
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-8">
          <Section icon={Building2} title="معلومات أساسية">
            <Field label="الاسم بالإنجليزية" value={supplier.supplierNameEn} />
            <Field label="التصنيف" value={supplier.categoryName} />
            <Field label="الفئة" value={supplier.providerClassName} />
            <Field label="الحالة" value={supplier.statusName} />
            <Field label="مستوى الأهمية" value={supplier.importanceLevelName} />
          </Section>

          <Section icon={Phone} title="معلومات الاتصال">
            <Field label="الشخص المسؤول" value={supplier.contactPerson} />
            <Field label="الهاتف" value={supplier.phone} />
            <Field label="الهاتف الساخن" value={supplier.hotLine} />
            <Field label="البريد الإلكتروني" value={supplier.email} />
            <Field label="العنوان" value={supplier.headQuarterAddress} />
          </Section>

          <Section icon={CreditCard} title="معلومات مالية">
            <div className="grid grid-cols-2 gap-4">
              <Field label="رقم الضريبة" value={supplier.taxNumber} />
              <Field label="رقم VAT" value={supplier.vatNumber} />
              <Field
                label="السجل التجاري"
                value={supplier.commercialRegistrationNumber}
              />
              <Field
                label="نسبة الخصم المحلي"
                value={
                  supplier.localDiscountPercentage != null
                    ? `${supplier.localDiscountPercentage}%`
                    : null
                }
              />
              <Field
                label="نسبة الخصم المستورد"
                value={
                  supplier.importedDiscountPercentage != null
                    ? `${supplier.importedDiscountPercentage}%`
                    : null
                }
              />
              <Field label="أيام الدفعة" value={supplier.batchDueDays} />
              <Field
                label="خاضع للضريبة"
                value={supplier.isTaxable ? 'نعم' : 'لا'}
              />
            </div>
          </Section>

          {supplier.notes && (
            <Section icon={FileText} title="ملاحظات">
              <p className="text-lg text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed">
                {supplier.notes}
              </p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDetails;
