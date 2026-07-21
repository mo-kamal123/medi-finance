import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, CreditCard, Info, Paperclip } from 'lucide-react';
import PageLoader from '../../../shared/ui/page-loader';
import { useCustomer } from '../hooks/customers.queries';

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

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: customer, isLoading } = useCustomer(id);

  if (isLoading) return <PageLoader label="جاري تحميل بيانات العميل..." />;
  if (!customer) return <div className="p-6 text-center text-gray-500">العميل غير موجود</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
                <span className="text-2xl font-bold">{customer.customerNameAr?.[0]}</span>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{customer.customerNameAr}</h1>
                <p className="text-white/70 mt-0.5">{customer.customerCode}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/customers')}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} />
              العودة إلى العملاء
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-8">
          <Section icon={Building2} title="معلومات أساسية">
            <Field label="الاسم بالإنجليزية" value={customer.customerNameEn} />
            <Field label="التصنيف" value={customer.categoryName} />
            <Field label="الحالة" value={customer.statusName} />
            <Field label="أيام السداد" value={customer.reimbursementDueDays} />
          </Section>

          <Section icon={CreditCard} title="معلومات الحساب">
            <div className="grid grid-cols-2 gap-4">
              <Field label="كود الحساب" value={customer.accountCode} />
              <Field label="اسم الحساب بالعربية" value={customer.accountNameAr} />
              <Field label="اسم الحساب بالإنجليزية" value={customer.accountNameEn} />
              <Field label="نوع الحساب" value={customer.accountType} />
              <Field label="سعر الصرف" value={customer.exchangeRate} />
            </div>
          </Section>

          <Section icon={Info} title="معلومات إضافية">
            <Field label="تاريخ الإنشاء" value={customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('ar-EG') : null} />
            <Field label="إنشاء بواسطة" value={customer.createdBy} />
          </Section>

          {customer.attachments?.length > 0 && (
            <Section icon={Paperclip} title="المرفقات">
              <div className="flex flex-wrap gap-3">
                {customer.attachments.map((att) => (
                  <a
                    key={att.attachmentID}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
                  >
                    <Paperclip size={16} />
                    مرفق {att.attachmentID}
                  </a>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
