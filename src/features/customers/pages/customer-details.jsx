import { useParams } from 'react-router-dom';
import PageLoader from '../../../shared/ui/page-loader';
import CustomerForm from '../components/customer-form';
import { useCustomer } from '../hooks/customers.queries';

const CustomerDetails = () => {
  const { id } = useParams();
  const { data, isLoading } = useCustomer(id);

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
            ccCode: '',
            nameAr: 'Default',
          },
        ]}
        onSubmit={(formData) => {
          console.log('Updated Data:', formData);
        }}
      />
    </div>
  );
};

export default CustomerDetails;
