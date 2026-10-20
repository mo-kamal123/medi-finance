// Edit/view any invoice by id (type-agnostic).

import { useCallback, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { BookCheck, DollarSign, FileText, BookOpen } from 'lucide-react';
import PageLoader from '../../../../../shared/ui/page-loader';
import Breadcrumb from '../../../../../shared/ui/breadcrumb';
import JournalEntryForm from '../../../entries/components/journal-entry-form';
import { useJournalEntry } from '../../../entries/hooks/entries.queries';
import InvoiceForm from '../components/invoice-form';
import InvoiceSummaryCards from '../components/invoice-summary-cards';
import PayInvoiceModal from '../components/pay-invoice-modal';
import { useUpdateInvoice } from '../hooks/invoices.mutations';
import { useInvoice } from '../hooks/invoices.queries';
import ReturnBatchButton from '../../../../master-data/batches/components/return-batch-button';
import BatchInvoiceDetails from '../components/batch-invoice-details';

const TABS = [
  { key: 'details', label: 'تفاصيل الفاتورة', icon: FileText },
  { key: 'journal', label: 'القيد المحاسبي', icon: BookOpen },
];

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(
    location.state?.openClosingEntry ? 'closing' : 'details'
  );

  const {
    data: invoice,
    isLoading: isFetching,
    error: invoiceError,
    refetch,
  } = useInvoice(id);
  const [summary, setSummary] = useState(null);
  const handleTotalsChange = useCallback(
    (totals) => {
      setSummary({ invoice, totals });
    },
    [invoice]
  );

  const journalEntryId =
    invoice?.journalEntryID || invoice?.journalEntry?.journalEntryID || null;

  const { data: journalEntry, isLoading: isLoadingJournalEntry } =
    useJournalEntry(journalEntryId);

  const closingEntryId = invoice?.batchClosureJournalEntryID;
  const selectedTab =
    activeTab === 'closing' && !closingEntryId ? 'details' : activeTab;
  const tabs = closingEntryId
    ? [...TABS, { key: 'closing', label: 'قيد الإقفال', icon: BookCheck }]
    : TABS;
  const {
    data: closingEntry,
    isLoading: isLoadingClosingEntry,
    refetch: refetchClosingEntry,
  } = useJournalEntry(selectedTab === 'closing' ? closingEntryId : null);

  const updateInvoiceMutation = useUpdateInvoice();
  const isBatchInvoice = Boolean(invoice?.batchID || invoice?.batchNumber);

  const remainingAmount =
    invoice?.remainingAmount ??
    (invoice?.netAmount ?? 0) - (invoice?.paidAmount ?? 0);

  const invoiceTypeName =
    invoice?.invoiceTypeNameAr ||
    invoice?.invoiceTypeNameEn ||
    (invoice?.customerID ? 'فاتورة عميل' : 'فاتورة مورد');
  const partyName =
    invoice?.customerNameAr ||
    invoice?.customerName ||
    invoice?.customerNameEn ||
    invoice?.supplierNameAr ||
    invoice?.supplierName ||
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

  if (invoiceError || !invoice?.invoiceID) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800"
      >
        <p>تعذر تحميل تفاصيل الفاتورة.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 font-semibold underline"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const breadcrumbItems = isBatchInvoice
    ? [
        { label: 'فواتير المطالبات', to: '/batches-invoices' },
        { label: invoice.invoiceNumber || 'تفاصيل الفاتورة' },
      ]
    : invoice?.customerID
      ? [
          { label: 'فواتير العملاء', to: '/customers-invoices' },
          { label: invoice?.invoiceNumber || 'تفاصيل الفاتورة' },
        ]
      : [
          { label: 'فواتير الموردين', to: '/suppliers-invoices' },
          { label: invoice?.invoiceNumber || 'تفاصيل الفاتورة' },
        ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="overflow-hidden rounded-2xl">
        <div className="px-8 py-6 bg-linear-to-r from-primary to-primary/80">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-white">
              <h1 className="text-2xl font-bold">
                {invoice?.invoiceNumber || 'فاتورة'}
              </h1>
              <p className="mt-0.5 text-white/70">
                {invoiceTypeName}
                {partyName ? ` — ${partyName}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {isBatchInvoice && (
                <ReturnBatchButton batchNumber={invoice.batchNumber} statusID={invoice.batchStatusID ?? invoice.batchStatusId} className="rounded-xl bg-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/30" />
              )}
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

      <InvoiceSummaryCards
        invoice={invoice}
        totals={
          !isBatchInvoice && summary?.invoice === invoice
            ? summary.totals
            : undefined
        }
      />

      {isPayModalOpen && (
        <PayInvoiceModal
          invoiceId={id}
          remainingAmount={remainingAmount}
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          onSuccess={refetch}
        />
      )}

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 px-4 pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.key;
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
          {selectedTab === 'details' &&
            (isBatchInvoice ? (
              <BatchInvoiceDetails invoice={invoice} />
            ) : (
              <InvoiceForm
                initialData={invoice}
                onSubmit={handleUpdate}
                isLoading={updateInvoiceMutation.isPending}
                onTotalsChange={handleTotalsChange}
                invoiceType={
                  invoice?.customerID
                    ? 'customer'
                    : invoice?.supplierID
                      ? 'supplier'
                      : undefined
                }
              />
            ))}

          {selectedTab === 'journal' && (
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

          {selectedTab === 'closing' &&
            closingEntryId &&
            (isLoadingClosingEntry ? (
              <PageLoader label="جاري تحميل قيد الإقفال..." />
            ) : closingEntry ? (
              <JournalEntryForm
                key={closingEntryId}
                defaultValues={closingEntry}
                mode="edit"
                showEntryDetailsButton
                viewOnly
              />
            ) : (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
              >
                <span>تعذر تحميل قيد الإقفال المرتبط بهذه الفاتورة.</span>
                <button
                  type="button"
                  onClick={() => refetchClosingEntry()}
                  className="font-semibold underline"
                >
                  إعادة المحاولة
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default EditInvoice;
