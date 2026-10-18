import { Link, useParams } from 'react-router-dom';
import PageLoader from '../../../../shared/ui/page-loader';
import NewBatchInvoicePage from '../../../transactions/invoices/batch-invoices/new-batch-invoice';
import { useBatch } from '../../../transactions/invoices/shared/hooks/invoices.queries';
import { TEST_BATCH_NUMBER, testBatch } from '../fixtures/test-batch';

const BatchDetailsPage = () => {
  const { batchNumber } = useParams();
  const isTestBatch = import.meta.env.DEV && batchNumber === TEST_BATCH_NUMBER;
  const { data: response, isLoading, isError, error, refetch } = useBatch(batchNumber, !isTestBatch);
  const batch = isTestBatch ? testBatch : response?.data ?? response;

  if (isLoading) return <PageLoader label="جاري تحميل بيانات الدفعة..." />;

  if (isError || response?.success === false || !batch || (!batch.batchNumber && !(Number(batch.batchID) > 0))) {
    return (
      <div role="alert" className="m-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-10 text-center">
        <h1 className="text-xl font-bold">{error?.response?.status === 404 ? 'الدفعة غير موجودة' : 'تعذر تحميل بيانات الدفعة'}</h1>
        <div className="flex justify-center gap-4">
          <button type="button" onClick={() => refetch()} className="rounded-lg bg-primary px-4 py-2 text-white">إعادة المحاولة</button>
          <Link to="/batches" className="rounded-lg border border-gray-300 px-4 py-2">العودة إلى الدفعات</Link>
        </div>
      </div>
    );
  }

  return <NewBatchInvoicePage key={batchNumber} initialBatch={batch} previewOnly={isTestBatch} />;
};

export default BatchDetailsPage;
