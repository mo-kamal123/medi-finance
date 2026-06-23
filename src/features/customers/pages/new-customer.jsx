import CustomerForm from '../components/customer-form';
import { useCreateCustomer } from '../hooks/customers.mutations';
import { useNavigate } from 'react-router-dom';

const NewCustomer = () => {
  const { mutate } = useCreateCustomer();
  const navigate = useNavigate();

  const submit = (data) => {
    mutate(data, {
      onSuccess: () => navigate('/customers'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h1 className="text-xl font-bold">إضافة عميل</h1>
      </div>
      <CustomerForm onSubmit={submit} />
    </div>
  );
};

export default NewCustomer;
