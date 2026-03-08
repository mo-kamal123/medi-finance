import CustomerForm from "../components/customer-form";
import { useCreateCustomer } from "../hooks/customers.mutations";
import { useNavigate } from "react-router-dom";

const NewCustomer = () => {
  const { mutate } = useCreateCustomer();
  const navigate = useNavigate();

  const submit = (data) => {
    mutate(data, {
      onSuccess: () => navigate("/customers"),
    });
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">إضافة عميل</h1>
      <CustomerForm onSubmit={submit} />
    </div>
  );
};

export default NewCustomer;