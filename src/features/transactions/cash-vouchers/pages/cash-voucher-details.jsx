import { useParams } from 'react-router-dom';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import CashVoucherForm from '../components/cash-voucher-form';
import { useCashVoucher } from '../hooks/cash-vouchers.queries';

const normalizeItem = (value) => value?.data ?? value;

const CashVoucherDetails = () => {
  const { id } = useParams();
  const { data } = useCashVoucher(id);
  const voucher = normalizeItem(data) || {};

  return (
    <div className="space-y-4 p-6">
      <Breadcrumb
        items={[
          { label: 'سندات القبض والدفع', to: '/cash-vouchers' },
          { label: `سند رقم ${voucher.voucherNumber || id}` },
        ]}
      />
      <CashVoucherForm defaultValues={voucher} mode="edit" />
    </div>
  );
};

export default CashVoucherDetails;
