import { useState } from 'react';

const GeneralLedgerFilter = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    accountId: '',
    fromDate: '',
    toDate: '',
    financialPeriodId: '',
    costCenterId: '',
    customerId: '',
    supplierId: '',
  });

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 focus:border-primary grid grid-cols-3 gap-4"
    >
      <input
        type="number"
        placeholder="رقم الحساب"
        value={filters.accountId}
        onChange={(e) => handleChange('accountId', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-primary"
      />

      <input
        type="date"
        value={filters.fromDate}
        onChange={(e) => handleChange('fromDate', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-primary"
      />

      <input
        type="date"
        value={filters.toDate}
        onChange={(e) => handleChange('toDate', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-primary"
      />

      <input
        type="number"
        placeholder="الفترة المالية"
        value={filters.financialPeriodId}
        onChange={(e) => handleChange('financialPeriodId', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-primary"
      />

      <input
        type="number"
        placeholder="مركز التكلفة"
        value={filters.costCenterId}
        onChange={(e) => handleChange('costCenterId', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-primary"
      />

      <input
        type="number"
        placeholder="العميل"
        value={filters.customerId}
        onChange={(e) => handleChange('customerId', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-primary"
      />

      <input
        type="number"
        placeholder="المورد"
        value={filters.supplierId}
        onChange={(e) => handleChange('supplierId', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-primary"
      />

      <button
        type="submit"
        className="col-span-3 bg-primary text-white py-2 rounded-lg"
      >
        تطبيق الفلترة
      </button>
    </form>
  );
};

export default GeneralLedgerFilter;
