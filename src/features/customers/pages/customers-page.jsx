import { useCustomers } from '../hooks/customers.queries';
import { useDeleteCustomer } from '../hooks/customers.mutations';
import CustomerTable from '../components/customer-table';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const CustomersPage = () => {
  const { data = [],isLoading } = useCustomers();
  const { mutate: deleteCustomer } = useDeleteCustomer();
  const navigate = useNavigate();
  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold"> العملاء</h1>
          <p className="text-sm text-gray-600">إدارة جميع العملاء بسهولة</p>
        </div>

        <button
          onClick={() => navigate('/customers/new')}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={16} />
          عميل جديد
        </button>
      </div>

      <CustomerTable
        data={data}
        onDelete={(index) => deleteCustomer(data[index].customerID)}
      />
    </div>
  );
};

export default CustomersPage;
