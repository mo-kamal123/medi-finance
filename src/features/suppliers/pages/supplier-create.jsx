import SupplierForm from "../components/supplier-form";
import { useCreateSupplier } from "../hooks/suppliers.queries";

const SupplierCreate = () => {
  const createSupplier = useCreateSupplier();

  const handleSubmit = (data) => {
    createSupplier.mutate(data);
  };

  return (
    <SupplierForm
      mode="create"
      onSubmit={handleSubmit}
    />
  );
};

export default SupplierCreate;