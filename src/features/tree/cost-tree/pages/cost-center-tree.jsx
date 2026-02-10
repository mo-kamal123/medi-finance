import { useMemo, useState } from 'react';
import { Search, Download, RefreshCw } from 'lucide-react';
import TreeNode from '../../components/tree-node';
import { buildTree } from '../../utils/buildTree';
import { costTree } from '../../utils/constants';

const CostCenterTree = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAll, setExpandedAll] = useState(false);

  // Build tree
  const treeData = useMemo(() => {
    return buildTree(costTree, {
      idKey: 'costCenterID',
      parentKey: 'parentID',
      sortKey: 'ccCode',
    });
  }, []);

  // Search filter
  const filterTree = (nodes, query) => {
    if (!query) return nodes;

    return nodes
      .map((node) => {
        const matches =
          node.nameAr.toLowerCase().includes(query.toLowerCase()) ||
          node.code.includes(query);

        const filteredChildren = node.children
          ? filterTree(node.children, query)
          : [];

        if (matches) {
          return { ...node, children: filteredChildren };
        } else if (filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }

        return null;
      })
      .filter(Boolean);
  };

  const filteredTree = useMemo(() => {
    return filterTree(treeData, searchQuery);
  }, [treeData, searchQuery]);

  // Actions
  const editCenter = (center) => {
    console.log('تعديل مركز التكلفة:', center);
  };

  const addSubCenter = (center) => {
    console.log('إضافة مركز فرعي إلى:', center);
  };

  const disableCenter = (center) => {
    console.log('تعطيل مركز التكلفة:', center);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
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
            <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium flex items-center gap-2">
              <RefreshCw size={16} />
              تحديث
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="ابحث عن مركز تكلفة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
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
                    onClick: disableCenter,
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
    </div>
  );
};

export default CostCenterTree;
