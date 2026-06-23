import { useNavigate } from 'react-router-dom';
import SupplierForm from '../components/supplier-form';
import { useCreateSupplier } from '../hooks/suppliers.queries';

const SupplierCreate = () => {
  const { mutate: createSupplier } = useCreateSupplier();
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    createSupplier(data, {
      onSuccess: () => navigate('/suppliers'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h1 className="text-xl font-bold">إضافة مورد</h1>
      </div>
      <SupplierForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
};

export default SupplierCreate;
