import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';

import Table from '../../../shared/ui/table';
import { useCommercialPapers } from '../hooks/commercial-papers.queries';
import { useDeleteCommercialPaper } from '../hooks/commercial-papers.mutations';

const CommercialPapersPage = () => {
  const navigate = useNavigate();
  const { mutate: deleteItem } = useDeleteCommercialPaper();

  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
  });

  const { data, isLoading } = useCommercialPapers(filters);

  const columns = useMemo(
    () => [
      {
        header: 'رقم الورقة',
        key: 'paperNumber',
      },
      {
        header: 'نوع الورقة',
        key: 'noteTypeNameAr',
      },
      {
        header: 'التصنيف',
        key: 'paperType',
        type: 'custom',
        render: (row) => (
          <span
            className={`px-2 py-1 rounded text-xs ${
              row.paperType === 'RECEIVABLE'
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {row.paperType === 'RECEIVABLE' ? 'قبض' : 'دفع'}
          </span>
        ),
      },
      {
        header: 'الطرف',
        key: 'partyName',
      },
      {
        header: 'القيمة',
        key: 'amount',
        type: 'custom',
        render: (row) => row.amount,
      },
      {
        header: 'تاريخ الإصدار',
        key: 'issueDate',
        type: 'custom',
        render: (row) =>
          row.issueDate
            ? new Date(row.issueDate).toLocaleDateString('ar-EG')
            : '-',
      },
      {
        header: 'تاريخ الاستحقاق',
        key: 'maturityDate',
        type: 'custom',
        render: (row) =>
          row.maturityDate
            ? new Date(row.maturityDate).toLocaleDateString('ar-EG')
            : '-',
      },
      {
        header: 'الحالة',
        key: 'statusNameAr',
      },
      {
        header: 'الموقع',
        key: 'location',
        type: 'custom',
        render: (row) => {
          const map = {
            IN_HOUSE: 'بالخزنة',
            COLLECTED: 'تم التحصيل',
          };
          return map[row.location] || row.location;
        },
      },
      {
        header: 'الأيام المتبقية',
        key: 'daysToMaturity',
        type: 'custom',
        render: (row) => (
          <span
            className={
              row.daysToMaturity < 0 ? 'text-red-500' : 'text-green-600'
            }
          >
            {row.daysToMaturity}
          </span>
        ),
      },
      {
        header: 'الإجراءات',
        key: 'actions',
        type: 'custom',
        render: (row) => (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => navigate(`/commercial-papers/${row.paperID}`)}
              className="text-blue-600"
            >
              <Eye size={18} />
            </button>

            <button
              onClick={() => navigate(`/commercial-papers/edit/${row.paperID}`)}
              className="text-green-600"
            >
              <Pencil size={18} />
            </button>

            <button
              onClick={() => deleteItem(row.paperID)}
              className="text-red-600"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">الأوراق التجارية</h1>

        <button
          onClick={() => navigate('/commercial-papers/new')}
          className="bg-primary text-white px-4 py-2 flex justify-between items-center gap-3 rounded"
        >
          <Plus size={16} /> إضافة
        </button>
      </div>

      <Table columns={columns} data={data} loading={isLoading} />
    </div>
  );
};

export default CommercialPapersPage;
