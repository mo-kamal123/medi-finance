import { useMemo, useState } from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { accountsTree } from '../../utils/constants';
import TreeNode from '../../components/tree-node';
import { buildTree } from '../../utils/buildTree';

const AccountsTree = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedAll, setExpandedAll] = useState(false);

  // Build tree structure
  const treeData = useMemo(() => {
    return buildTree(accountsTree, {
      idKey: 'accountID',
      parentKey: 'parentID',
      sortKey: 'accountCode',
    });
  }, []);
  // Filter accounts based on search and type
  const filterTree = (accounts, query, type) => {
    if (!query && type === 'all') return accounts;

    return accounts
      .map((account) => {
        const matchesSearch =
          !query ||
          account.nameAr.toLowerCase().includes(query.toLowerCase()) ||
          account.nameEn.toLowerCase().includes(query.toLowerCase()) ||
          account.accountCode.includes(query);

        const matchesType = type === 'all' || account.accountType === type;

        const filteredChildren = account.children
          ? filterTree(account.children, query, type)
          : [];

        if (matchesSearch && matchesType) {
          return { ...account, children: filteredChildren };
        } else if (filteredChildren.length > 0) {
          return { ...account, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean);
  };

  const filteredTree = useMemo(() => {
    return filterTree(treeData, searchQuery, filterType);
  }, [treeData, searchQuery, filterType]);

  // Get unique account types for filter
  const accountTypes = useMemo(() => {
    const types = new Set(accountsTree.map((acc) => acc.accountType));
    return Array.from(types).sort();
  }, []);

  // Count statistics
  const stats = useMemo(() => {
    const total = accountsTree.length;
    const active = accountsTree.filter((acc) => acc.isActive).length;
    const byType = accountTypes.reduce((acc, type) => {
      acc[type] = accountsTree.filter((t) => t.accountType === type).length;
      return acc;
    }, {});

    return { total, active, byType };
  }, [accountTypes]);

  const editAccount = (account) => {
    console.log('تعديل الحساب:', account);
  };

  const addSubAccount = (account) => {
    console.log('إضافة حساب فرعي إلى:', account);
  };

  const disableAccount = (account) => {
    console.log('تعطيل الحساب:', account);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              شجرة الحسابات
            </h1>
            <p className="text-gray-600 text-sm">
              عرض وإدارة جميع الحسابات المحاسبية
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center gap-2">
              <Download size={16} />
              تصدير
            </button>
            <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <RefreshCw size={16} />
              تحديث
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">إجمالي الحسابات</div>
            <div className="text-xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3">
            <div className="text-sm text-emerald-600 mb-1">نشطة</div>
            <div className="text-xl font-bold text-emerald-700">
              {stats.active}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm text-blue-600 mb-1">غير نشطة</div>
            <div className="text-xl font-bold text-blue-700">
              {stats.total - stats.active}
            </div>
          </div>
          <div className="bg-primary/10 rounded-lg p-3">
            <div className="text-sm text-primary mb-1">أنواع الحسابات</div>
            <div className="text-xl font-bold text-primary">
              {accountTypes.length}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="ابحث عن حساب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-start"
            />
          </div>
          <div className="relative">
            <Filter
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-48 pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white text-start"
            >
              <option value="all">جميع الأنواع</option>
              {accountTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tree View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
            <div className="space-y-1">
              {filteredTree.map((account) => (
                <TreeNode
                  node={account}
                  expandedAll={expandedAll}
                  getLabel={(a) => a.nameAr}
                  getCode={(a) => a.accountCode}
                  getChildren={(a) => a.children}
                  getParentId={(a) => a.parentId}
                  actions={[
                    { label: 'تعديل الحساب', onClick: editAccount },
                    { label: 'إضافة حساب فرعي', onClick: addSubAccount },
                    {
                      label: 'تعطيل الحساب',
                      onClick: disableAccount,
                      danger: true,
                    },
                  ]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد حسابات مطابقة للبحث</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountsTree;
