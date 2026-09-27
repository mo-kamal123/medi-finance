import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import ReconciliationDetails from '../components/reconciliation-details';

const ReconciliationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-4 p-6">
      <Breadcrumb
        items={[
          { label: 'البنوك' },
          { label: 'تسويات البنك', to: '/reconciliations' },
          { label: `تسوية رقم ${id}` },
        ]}
      />
      <ReconciliationDetails
        reconciliationId={id}
        onBack={() => navigate('/reconciliations')}
      />
    </div>
  );
};

export default ReconciliationDetailsPage;
