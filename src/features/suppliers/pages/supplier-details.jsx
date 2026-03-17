import { useParams } from "react-router-dom";
import { useSupplier } from "../hooks/suppliers.queries";
import SupplierForm from "../components/supplier-form";

const SupplierDetails = () => {
  const { id } = useParams();
  const { data } = useSupplier(id);

  if (!data) return null;

  return (
    <SupplierForm
      mode="update"
      defaultValues={data}
      onSubmit={(data) => console.log(data)}
    />
  );
};

export default SupplierDetails;