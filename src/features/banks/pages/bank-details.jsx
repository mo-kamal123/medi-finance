import { useParams } from 'react-router-dom';
import PageLoader from '../../../shared/ui/page-loader';
import BankAccountsPanel from '../components/bank-accounts-panel';
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

  return (
    <div className="space-y-6">
      <BankForm defaultValues={data} mode="view" />
      <BankAccountsPanel bankId={id} />
    </div>
  );
};

export default BankDetails;
