import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';

import FormInput from '../../../shared/ui/input';
import Pagination from '../../../shared/ui/pagination';
import Table from '../../../shared/ui/table';
import { matchesSearch, paginateItems } from '../../../shared/utils/list-utils';
import { useCommercialPapers } from '../hooks/commercial-papers.queries';
import { useDeleteCommercialPaper } from '../hooks/commercial-papers.mutations';

const PAGE_CONFIG = {
  RECEIVABLE: {
    title: 'أوراق القبض',
    addLabel: 'إضافة ورقة قبض',
    newPath: '/commercial-papers/receivable/new',
    typeLabel: 'قبض',
    typeClasses: 'bg-green-100 text-green-700',
  },
  PAYABLE: {
    title: 'أوراق الدفع',
    addLabel: 'إضافة ورقة دفع',
    newPath: '/commercial-papers/payable/new',
    typeLabel: 'دفع',
    typeClasses: 'bg-orange-100 text-orange-700',
  },
};

const locationLabels = {
  IN_HOUSE: 'بالخزنة',
  COLLECTED: 'تم التحصيل',
};

const CommercialPapersPage = ({ paperType }) => {
  const navigate = useNavigate();
  const { mutate: deleteItem } = useDeleteCommercialPaper();
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data = [], isLoading } = useCommercialPapers({
    paperType,
    ...(search ? { search } : {}),
  });
  const pageConfig = PAGE_CONFIG[paperType] || PAGE_CONFIG.RECEIVABLE;

  const filteredPapers = useMemo(
    () =>
      data.filter((paper) =>
        matchesSearch(
          paper,
          [
            'paperNumber',
            'noteTypeNameAr',
            'partyName',
            'statusNameAr',
            'location',
          ],
          search
        )
      ),
    [data, search]
  );

  const pagination = useMemo(
    () => paginateItems(filteredPapers, pageNumber, pageSize),
    [filteredPapers, pageNumber, pageSize]
  );

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
        render: () => (
          <span
            className={`px-2 py-1 rounded text-xs ${pageConfig.typeClasses}`}
          >
            {pageConfig.typeLabel}
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
        render: (row) => locationLabels[row.location] || row.location,
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
    [deleteItem, navigate, pageConfig.typeClasses, pageConfig.typeLabel]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">{pageConfig.title}</h1>

        <button
          onClick={() => navigate(pageConfig.newPath)}
          className="bg-primary text-white px-4 py-2 flex justify-between items-center gap-3 rounded"
        >
          <Plus size={16} /> {pageConfig.addLabel}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <FormInput
          label="بحث"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPageNumber(1);
          }}
          placeholder="ابحث برقم الورقة أو الطرف"
        />
      </div>

      <Table columns={columns} data={pagination.items} loading={isLoading} />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        onPageChange={setPageNumber}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPageNumber(1);
        }}
      />
    </div>
  );
};

export default CommercialPapersPage;
