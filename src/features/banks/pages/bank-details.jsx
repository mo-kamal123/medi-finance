import { useParams } from 'react-router-dom';
import PageLoader from '../../../shared/ui/page-loader';
import BankForm from '../components/bank-form';
import { useBank } from '../hooks/banks.queries';

const BankDetails = () => {
  const { id } = useParams();
  const { data, isLoading } = useBank(id);

  if (isLoading) {
    return <PageLoader label="جاري تحميل بيانات البنك..." />;
  }

  if (!data) {
    return <div>لا توجد بيانات.</div>;
  }

  return <BankForm defaultValues={data} mode="view" />;
};

export default BankDetails;
