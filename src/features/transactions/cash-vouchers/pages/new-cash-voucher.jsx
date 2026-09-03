import { useLocation } from 'react-router-dom';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import CashVoucherForm from '../components/cash-voucher-form';

const NewCashVoucher = () => {
  const location = useLocation();
  const initialPaymentMode = location.state?.fromCashTransactions ? '2' : undefined;
  return (
    <div className="space-y-4 p-6">
      <Breadcrumb
        items={[
          { label: 'سندات القبض والدفع', to: '/cash-vouchers' },
          { label: 'إضافة سند' },
        ]}
      />
      <CashVoucherForm initialPaymentMode={initialPaymentMode} />
    </div>
  );
};

export default NewCashVoucher;
