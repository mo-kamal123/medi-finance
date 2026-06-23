import { useNavigate, useParams } from 'react-router-dom';
import { useSupplier } from '../hooks/suppliers.queries';
import { useUpdateSupplier } from '../hooks/suppliers.queries';
import SupplierForm from '../components/supplier-form';

const SupplierDetails = () => {
  const { id } = useParams();
  const { data } = useSupplier(id);
  const { mutate: updateSupplier } = useUpdateSupplier();
  const navigate = useNavigate();

  if (!data) return null;

  return (
    <SupplierForm
      mode="update"
      defaultValues={data}
      onSubmit={(formData) => {
        updateSupplier(
          { id, data: formData },
          { onSuccess: () => navigate('/suppliers') }
        );
      }}
    />
  );
};

export default SupplierDetails;
