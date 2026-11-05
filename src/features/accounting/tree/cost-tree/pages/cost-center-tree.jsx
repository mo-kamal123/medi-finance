import { useMemo, useState } from 'react';
import {
  Ban,
  Network,
  // Link,
  Pencil,
  PlusCircle,
  PlusIcon,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useCostTree from '../hooks/use-cost-tree';
import TreeNode, { GRID_COLUMNS } from '../../components/tree-node';
import { buildTree } from '../../utils/buildTree';
import { filterTree } from '../../utils/filterTree';
import SearchFilter from '../../../../../shared/components/search-filter';
import Breadcrumb from '../../../../../shared/ui/breadcrumb';
import ConfirmModal from '../../../../../shared/ui/modal';

const CostCenterTree = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const { data: costTree = [], isPending, isError, refetch } = useCostTree();
  const navigate = useNavigate();

  const treeData = useMemo(
    () =>
      buildTree(
        costTree.map((center) => ({
          ...center,
          accountCode: center.ccCode,
          accountType: center.costCenterType || 'عام',
        })),
        { idKey: 'costCenterID', parentKey: 'parentID', sortKey: 'ccCode' }
      ),
    [costTree]
  );
  const centerTypes = useMemo(
    () =>
      [
        ...new Set(costTree.map((center) => center.costCenterType || 'عام')),
      ].sort(),
    [costTree]
  );
  const filteredTree = useMemo(
    () => filterTree(treeData, searchQuery, filterType),
    [treeData, searchQuery, filterType]
  );
  const activeCount = costTree.filter((center) => center.isActive).length;
  const summaryCards = [
    {
      label: 'إجمالي مراكز التكلفة',
      value: costTree.length,
      text: 'text-gray-900',
    },
    {
      label: 'نشطة',
      value: activeCount,
      text: 'text-emerald-700',
    },
    {
      label: 'غير نشطة',
      value: costTree.length - activeCount,
      text: 'text-red-600',
    },
    {
      label: 'أنواع المراكز',
      value: centerTypes.length,
      text: 'text-primary',
    },
  ];
  const actions = [
    {
      label: 'تعديل المركز',
      icon: Pencil,
      onClick: (center) => navigate(`${center.costCenterID}`),
    },
    {
      label: 'إضافة مركز فرعي',
      icon: PlusCircle,
      onClick: (center) => navigate(`new?parentID=${center.costCenterID}`),
    },
    {
      label: 'تعطيل المركز',
      icon: Ban,
      danger: true,
      onClick: (center) => {
        setSelectedCenter(center);
        setModalOpen(true);
      },
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb items={[{ label: 'شجرة مراكز التكلفة' }]} />
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Network size={20} aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold md:text-2xl">
                شجرة مراكز التكلفة
              </h1>
              <p className="text-sm text-gray-600">
                عرض وإدارة جميع مراكز التكلفة
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* <button
              type="button"
              onClick={() => navigate('/link')}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Link size={16} />
              ربط
            </button> */}
            <button
              type="button"
              onClick={() => navigate('new')}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              <PlusIcon size={16} />
              انشاء
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="text-sm text-gray-500">{card.label}</div>
            <div className={`mt-2 text-lg font-semibold ${card.text}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterValue={filterType}
          onFilterChange={setFilterType}
          filterOptions={centerTypes}
          searchPlaceholder="ابحث باسم المركز أو الكود..."
          allLabel="جميع الأنواع"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-h-150 overflow-auto">
          <div className="min-w-[620px]">
            <div
              className="sticky top-0 z-10 grid items-center bg-primary px-3 py-4 text-start text-sm font-semibold text-white"
              style={{ gridTemplateColumns: GRID_COLUMNS }}
            >
              <span className="ps-[54px]">اسم المركز</span>
              <span>الكود</span>
              <span>الحالة</span>
              <span>نهائي</span>
              <span>الإجراءات</span>
            </div>
            <div>
              {isPending ? (
                <div
                  role="status"
                  className="flex items-center justify-center gap-2 py-12 text-gray-400"
                >
                  <RefreshCw size={24} className="animate-spin" />
                  جاري تحميل مراكز التكلفة...
                </div>
              ) : isError ? (
                <div role="alert" className="p-8 text-center text-red-700">
                  تعذر تحميل مراكز التكلفة.
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className="mx-3 underline"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : filteredTree.length ? (
                filteredTree.map((center) => (
                  <TreeNode
                    key={center.costCenterID}
                    node={center}
                    expandedAll={null}
                    getLabel={(item) => item.nameAr || item.nameEn}
                    getCode={(item) => item.ccCode}
                    getChildren={(item) => item.children}
                    getParentId={(item) => item.parentID}
                    renderExtraColumn={(item) => (
                      <span
                        className={`text-sm font-medium ${item.isFinal ? 'text-primary' : 'text-gray-400'}`}
                      >
                        {item.isFinal ? 'نعم' : 'لا'}
                      </span>
                    )}
                    actions={actions}
                  />
                ))
              ) : (
                <p className="py-12 text-center text-gray-500">
                  لا توجد مراكز تكلفة مطابقة للبحث
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          console.log('تم تعطيل مركز التكلفة:', selectedCenter);
          setModalOpen(false);
        }}
        title="تعطيل مركز التكلفة"
        description={`هل أنت متأكد من رغبتك في تعطيل المركز: ${selectedCenter?.nameAr || ''}؟`}
        confirmText="نعم، تعطيل"
        cancelText="إلغاء"
      />
    </div>
  );
};

export default CostCenterTree;
