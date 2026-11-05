import { useMemo, useState } from 'react';
import {
  Ban,
  CheckCircle,
  FolderTree,
  Layers,
  Link,
  Pencil,
  PlusCircle,
  PlusIcon,
  RefreshCw,
  XCircle,
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
  const [expandedAll, setExpandedAll] = useState(null);
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
      icon: <FolderTree size={20} />,
      text: 'text-gray-900',
      labelColor: 'text-gray-600',
      iconColor: 'bg-gray-100 text-gray-600',
    },
    {
      label: 'نشطة',
      value: activeCount,
      icon: <CheckCircle size={20} />,
      text: 'text-emerald-700',
      labelColor: 'text-emerald-600',
      iconColor: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'غير نشطة',
      value: costTree.length - activeCount,
      icon: <XCircle size={20} />,
      text: 'text-red-700',
      labelColor: 'text-red-600',
      iconColor: 'bg-red-100 text-red-600',
    },
    {
      label: 'أنواع المراكز',
      value: centerTypes.length,
      icon: <Layers size={20} />,
      text: 'text-primary',
      labelColor: 'text-primary',
      iconColor: 'bg-primary/10 text-primary',
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
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'شجرة مراكز التكلفة' }]} />
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold md:text-2xl">
              شجرة مراكز التكلفة
            </h1>
            <p className="text-sm text-gray-600">
              عرض وإدارة جميع مراكز التكلفة
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/link')}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Link size={16} />
              ربط
            </button>
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
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`mt-3 mb-1 text-lg font-medium ${card.labelColor}`}
                >
                  {card.label}
                </div>
                <div
                  aria-hidden="true"
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${card.iconColor}`}
                >
                  {card.icon}
                </div>
              </div>
              <div className={`text-3xl font-bold ${card.text}`}>
                {card.value}
              </div>
            </div>
          ))}
        </div>
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
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
          <h2 className="text-lg font-semibold text-gray-900">عرض الشجرة</h2>
          <button
            type="button"
            onClick={() => setExpandedAll((previous) => !previous)}
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            {expandedAll ? 'طي الكل' : 'توسيع الكل'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[620px]">
            <div
              className="grid items-center border-b-2 border-gray-200 bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-600"
              style={{ gridTemplateColumns: GRID_COLUMNS }}
            >
              <span>اسم المركز</span>
              <span>الكود</span>
              <span>الحالة</span>
              <span>نهائي</span>
              <span className="text-right">الإجراءات</span>
            </div>
            <div className="max-h-150 overflow-y-auto">
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
                    expandedAll={expandedAll}
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
