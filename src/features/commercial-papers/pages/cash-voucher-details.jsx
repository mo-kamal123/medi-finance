import { useParams } from 'react-router-dom';
import CashVoucherForm from '../components/cash-voucher-form';
import { useCashVoucher } from '../hooks/commercial-papers.queries';

const normalizeItem = (value) => value?.data ?? value;

const CashVoucherDetails = () => {
  const { id } = useParams();
  const { data } = useCashVoucher(id);

  return <CashVoucherForm defaultValues={normalizeItem(data) || {}} mode="view" />;
};

export default CashVoucherDetails;
