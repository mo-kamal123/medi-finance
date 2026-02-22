import { useMemo, useState } from 'react';
import { Search, Download, RefreshCw, PlusIcon } from 'lucide-react';
import TreeNode from '../../components/tree-node';
import { buildTree } from '../../utils/buildTree';
import { costTree } from '../../utils/constants';
import { filterTree } from '../../utils/filterTree';
import SearchFilter from '../../../../shared/components/search-filter';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../../shared/ui/modal';

const CostCenterTree = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedAll, setExpandedAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);

  const navigate = useNavigate();

  // Build tree
  const treeData = useMemo(() => {
    return buildTree(costTree, {
      idKey: 'costCenterID',
      parentKey: 'parentID',
      sortKey: 'ccCode',
    });
  }, []);

  // Unique cost center types
  const accountTypes = useMemo(() => {
    const types = new Set(costTree.map((c) => c.costCenterType || 'عام'));
    return Array.from(types).sort();
  }, []);

  // Filtered tree
  const filteredTree = useMemo(() => {
    return filterTree(treeData, searchQuery, filterType);
  }, [treeData, searchQuery, filterType]);

  // Actions
  const editCenter = (center) => {
    navigate(`${center.costCenterID}`);
  };

  const addSubCenter = (center) => {
    navigate(`new?parentID=${center.costCenterID}`);
  };

  const handleDisableClick = (center) => {
    setSelectedCenter(center);
    setModalOpen(true);
  };

  const handleConfirmDisable = () => {
    console.log('تم تعطيل مركز التكلفة:', selectedCenter);
    // هنا تستدعي API لتعطيل المركز
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              شجرة مراكز التكلفة
            </h1>
            <p className="text-gray-600 text-sm">إدارة وتنظيم مراكز التكلفة</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2">
              <Download size={16} />
              تصدير
            </button>
            <button onClick={() => navigate('new')} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium flex items-center gap-2">
              <PlusIcon size={16} />
              انشاء
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterValue={filterType}
          onFilterChange={setFilterType}
          filterOptions={accountTypes}
          searchPlaceholder="ابحث عن مركز..."
          allLabel="جميع الأنواع"
        />
      </div>

      {/* Tree */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">عرض الشجرة</h2>
            <button
              onClick={() => setExpandedAll(!expandedAll)}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              {expandedAll ? 'طي الكل' : 'توسيع الكل'}
            </button>
          </div>
        </div>

        <div className="p-4 max-h-150 overflow-y-auto">
          {filteredTree.length > 0 ? (
            filteredTree.map((center) => (
              <TreeNode
                key={center.costCenterID}
                node={center}
                expandedAll={expandedAll}
                getLabel={(c) => c.nameAr}
                getCode={(c) => c.ccCode}
                getChildren={(c) => c.children}
                getParentId={(c) => c.parentID}
                actions={[
                  { label: 'تعديل المركز', onClick: editCenter },
                  { label: 'إضافة مركز فرعي', onClick: addSubCenter },
                  {
                    label: 'تعطيل المركز',
                    onClick: () => handleDisableClick(center),
                    danger: true,
                  },
                ]}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">
              لا توجد مراكز تكلفة
            </p>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDisable}
        title="تعطيل مركز التكلفة"
        description={`هل أنت متأكد من رغبتك في تعطيل المركز: ${selectedCenter?.nameAr || ""}؟`}
        confirmText="نعم، تعطيل"
        cancelText="إلغاء"
      />
    </div>
  );
};

export default CostCenterTree;