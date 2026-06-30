import { useLocation } from 'react-router-dom';
import CashVoucherForm from '../components/cash-voucher-form';

const NewCashVoucher = () => {
  const location = useLocation();
  const initialPaymentMode = location.state?.fromCashTransactions ? '2' : undefined;
  return <CashVoucherForm initialPaymentMode={initialPaymentMode} />;
};

export default NewCashVoucher;
