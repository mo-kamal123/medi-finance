import { useState, useMemo } from 'react';
import InvoiceTable from '../components/invoice-table';
import InvoiceFilters from '../components/invoice-filter';
import { invoicesData } from '../utils/data';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvoicesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const filteredInvoices = useMemo(() => {
    return invoicesData.filter((inv) => {
      const matchesSearch =
        inv.number.includes(searchQuery) || inv.client.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const onAddInvoice = () => {
    navigate('/invoices/new')
  }
  return (
    <div className="space-y-6 p-6">
              {/* Welcome Section + Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">مرحبا بك في لوحة الفواتير</h1>
          <p className="text-gray-600 text-sm">هنا يمكنك إدارة جميع الفواتير ومتابعتها بسهولة.</p>
        </div>

        <button
          onClick={onAddInvoice}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={16} />
          إضافة فاتورة جديدة
        </button>
      </div>

      <InvoiceFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <InvoiceTable invoices={filteredInvoices} />
    </div>
  );
};

export default InvoicesPage;
