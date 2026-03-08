import { useParams } from "react-router-dom";
import { useCustomer } from "../hooks/customers.queries";
import CustomerForm from "../components/customer-form";

const CustomerDetails = () => {
  const { id } = useParams();
  const { data, isLoading } = useCustomer(id);

  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">

      <h1 className="text-xl font-bold">تفاصيل العميل</h1>

      <CustomerForm
        mode="update"
        defaultValues={data}
        currencies={[
          {
            currencyID: data.currencyID,
            currencyName: data.currencyNameEn,
          },
        ]}
        accounts={[
          {
            accountID: data.accountID,
            accountCode: data.accountCode,
            nameAr: data.nameAr,
          },
        ]}
        costCenters={[
          {
            costCenterID: data.defaultCostCenterID,
            ccCode: "",
            nameAr: "Default",
          },
        ]}
        onSubmit={(formData) => {
          console.log("Updated Data:", formData);
        }}
      />

    </div>
  );
};

export default CustomerDetails;