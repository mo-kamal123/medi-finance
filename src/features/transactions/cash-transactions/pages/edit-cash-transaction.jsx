import { useParams } from 'react-router-dom';
import CashTransactionForm from '../components/cash-transaction-form';
import { useCashTransaction } from '../hooks/cash-transactions.queries';

const EditCashTransactionPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useCashTransaction(id);

  if (isLoading) {
    return <div>جاري تحميل البيانات...</div>;
  }

  if (!data) {
    return <div>لا توجد بيانات.</div>;
  }

  return <CashTransactionForm defaultValues={data} mode="edit" />;
};

export default EditCashTransactionPage;
