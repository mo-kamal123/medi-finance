// Edit/view any invoice by id (type-agnostic).

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DollarSign, FileText, BookOpen } from 'lucide-react';
import PageLoader from '../../../../../shared/ui/page-loader';
import Breadcrumb from '../../../../../shared/ui/breadcrumb';
import JournalEntryForm from '../../../entries/components/journal-entry-form';
import { useJournalEntry } from '../../../entries/hooks/entries.queries';
import InvoiceForm from '../components/invoice-form';
import PayInvoiceModal from '../components/pay-invoice-modal';
import { useUpdateInvoice } from '../hooks/invoices.mutations';
import { useInvoice } from '../hooks/invoices.queries';

const TABS = [
  { key: 'details', label: 'تفاصيل الفاتورة', icon: FileText },
  { key: 'journal', label: 'القيد المحاسبي', icon: BookOpen },
];

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const { data: invoice, isLoading: isFetching, refetch } = useInvoice(id);

  const journalEntryId =
    invoice?.journalEntryID || invoice?.journalEntry?.journalEntryID || null;

  const { data: journalEntry, isLoading: isLoadingJournalEntry } =
    useJournalEntry(journalEntryId);

  const updateInvoiceMutation = useUpdateInvoice();

  const remainingAmount =
    invoice?.remainingAmount ??
    (invoice?.netAmount ?? 0) - (invoice?.paidAmount ?? 0);

  const invoiceTypeName = invoice?.customerID ? 'فاتورة عميل' : 'فاتورة مورد';
  const partyName =
    invoice?.customerNameAr ||
    invoice?.customerNameEn ||
    invoice?.supplierNameAr ||
    invoice?.supplierNameEn ||
    '';

  const handleUpdate = async (data) => {
    try {
      await updateInvoiceMutation.mutateAsync({
        id,
        ...data,
      });

      const redirectPath = invoice?.customerID
        ? '/customers-invoices'
        : invoice?.supplierID
          ? '/suppliers-invoices'
          : '/customers-invoices';

      navigate(redirectPath);
    } catch (error) {
      console.error(error);
    }
  };

  if (isFetching) {
    return <PageLoader label="جاري تحميل الفاتورة..." />;
  }

  const breadcrumbItems = invoice?.customerID
    ? [
        { label: 'فواتير العملاء', to: '/customers-invoices' },
        { label: invoice?.invoiceNumber || 'تفاصيل الفاتورة' },
      ]
    : [
        { label: 'فواتير الموردين', to: '/suppliers-invoices' },
        { label: invoice?.invoiceNumber || 'تفاصيل الفاتورة' },
      ];

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="overflow-hidden rounded-2xl">
        <div className="px-8 py-6 bg-linear-to-r from-primary to-primary/80">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-2xl font-bold">
                {invoice?.invoiceNumber || 'فاتورة'}
              </h1>
              <p className="mt-0.5 text-white/70">
                {invoiceTypeName}
                {partyName ? ` — ${partyName}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPayModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
              >
                <DollarSign size={16} />
                دفع الفاتورة
              </button>
            </div>
          </div>
        </div>
      </div>

      <PayInvoiceModal
        invoiceId={id}
        remainingAmount={remainingAmount}
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onSuccess={refetch}
      />

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 px-4 pt-3">
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
          {activeTab === 'details' && (
            <InvoiceForm
              initialData={invoice}
              onSubmit={handleUpdate}
              isLoading={updateInvoiceMutation.isPending}
              invoiceType={
                invoice?.customerID
                  ? 'customer'
                  : invoice?.supplierID
                    ? 'supplier'
                    : undefined
              }
            />
          )}

          {activeTab === 'journal' && (
            <>
              {isLoadingJournalEntry ? (
                <PageLoader label="جاري تحميل القيد المرتبط..." />
              ) : journalEntry ? (
                <JournalEntryForm
                  defaultValues={journalEntry}
                  mode="edit"
                  showEntryDetailsButton
                  viewOnly
                />
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  تعذر تحميل القيد المرتبط بهذه الفاتورة.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditInvoice;
