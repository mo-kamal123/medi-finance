import { useParams } from 'react-router-dom';
import PageLoader from '../../../shared/ui/page-loader';
import ChequeForm from '../components/cheque-form';
import { useCheque } from '../hooks/cheques.queries';

const ChequeDetails = () => {
  const { id } = useParams();
  const { data, isLoading } = useCheque(id);

  if (isLoading) {
    return <PageLoader label="جاري تحميل بيانات الشيك..." />;
  }

  if (!data) {
    return <div>لا توجد بيانات.</div>;
  }

  return <ChequeForm defaultValues={data} mode="view" />;
};

export default ChequeDetails;
