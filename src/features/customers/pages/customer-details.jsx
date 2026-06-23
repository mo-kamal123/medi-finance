import { useNavigate, useParams } from 'react-router-dom';
import PageLoader from '../../../shared/ui/page-loader';
import CustomerForm from '../components/customer-form';
import { useCustomer } from '../hooks/customers.queries';
import { useUpdateCustomer } from '../hooks/customers.mutations';

const CustomerDetails = () => {
  const { id } = useParams();
  const { data, isLoading } = useCustomer(id);
  const { mutate: updateCustomer } = useUpdateCustomer();
  const navigate = useNavigate();

  if (isLoading) {
    return <PageLoader label="جاري تحميل بيانات العميل..." />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">تفاصيل العميل</h1>

      <CustomerForm
        mode="update"
        defaultValues={data}
        onSubmit={(formData) => {
          updateCustomer(
            { id, data: formData },
            { onSuccess: () => navigate('/customers') }
          );
        }}
      />
    </div>
  );
};

export default CustomerDetails;
