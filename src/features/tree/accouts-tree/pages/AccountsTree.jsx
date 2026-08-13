import { useCallback, useMemo, useRef, useState } from 'react';
import { Ban, CheckCircle, FileText, FolderTree, Layers, Link, Pencil, PlusIcon, PlusCircle, RefreshCw, XCircle } from 'lucide-react';
import TreeNode from '../../components/tree-node';
import AccountActionsMenu from '../../components/account-actions-menu';
import { filterTree } from '../../utils/filterTree';
import SearchFilter from '../../../../shared/components/search-filter';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../../shared/ui/modal';
import { useDebounce } from '../../../../shared/lib/use-debounce';
import useAccountRoots from '../hooks/use-account-roots';
import useSearchAccounts from '../hooks/use-search-accounts';
import { getAccountChildren } from '../api/accounts-tree';

const getAccountId = (account) => account.accountID ?? account.id;

const flattenTree = (nodes) => {
  const result = [];
  const walk = (list) => {
    list.forEach((node) => {
      result.push(node);
      if (node.children?.length) walk(node.children);
    });
  };
  walk(nodes);
  return result;
};

const AccountsTree = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedAll, setExpandedAll] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [childrenCache, setChildrenCache] = useState({});
  const [loadingNodes, setLoadingNodes] = useState({});
  const pendingRef = useRef({});

  const { data: roots = [], isLoading: rootsLoading } = useAccountRoots({ isActive: true });
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchQuery, 500);
  const isSearching = searchQuery.trim().length > 0;

  const {
    data: searchResults = [],
    isFetching: searchLoading,
  } = useSearchAccounts({
    searchText: debouncedSearch,
    accountType: filterType,
  });

  const attachChildren = (nodes, cache) =>
    nodes.map((node) => ({
      ...node,
      children: node.hasChildren && cache[node.accountID]
        ? attachChildren(cache[node.accountID], cache)
        : (node.children ?? []),
    }));

  const treeWithChildren = useMemo(
    () => attachChildren(roots, childrenCache),
    [roots, childrenCache]
  );

  const allAccounts = useMemo(() => flattenTree(treeWithChildren), [treeWithChildren]);

  const filteredTree = useMemo(() => {
    return filterTree(treeWithChildren, searchQuery, filterType);
  }, [treeWithChildren, searchQuery, filterType]);

  const accountTypes = useMemo(() => {
    const types = new Set(allAccounts.map((acc) => acc.accountType));
    return Array.from(types).sort();
  }, [allAccounts]);

  const stats = useMemo(() => {
    const total = allAccounts.length;
    const active = allAccounts.filter((acc) => acc.isActive).length;
    const byType = accountTypes.reduce((acc, type) => {
      acc[type] = allAccounts.filter((t) => t.accountType === type).length;
      return acc;
    }, {});
    return { total, active, byType };
  }, [allAccounts, accountTypes]);

  const handleExpand = useCallback(async (node) => {
    const id = node.accountID;
    if (!node.hasChildren) return;
    if (pendingRef.current[id]) return;

    pendingRef.current[id] = true;
    setLoadingNodes((prev) => ({ ...prev, [id]: true }));
    try {
      const data = await getAccountChildren(id);
      setChildrenCache((prev) => ({ ...prev, [id]: data }));
    } finally {
      setLoadingNodes((prev) => ({ ...prev, [id]: false }));
      delete pendingRef.current[id];
    }
  }, []);

  const isLoading = useCallback((node) => !!loadingNodes[node.accountID], [loadingNodes]);

  const editAccount = (account) => {
    navigate(`${getAccountId(account)}`);
  };

  const addSubAccount = (account) => {
    navigate(`new?parentId=${getAccountId(account)}`);
  };

  const disableAccount = (account) => {
    setSelectedNode(account);
    setModalOpen(true);
  };

  const handleConfirmDisable = () => {
    console.log('تم تعطيل:', selectedNode);
    setModalOpen(false);
  };

  const actions = [
    { label: 'تعديل الحساب', onClick: editAccount, icon: Pencil },
    {
      label: 'إضافة حساب فرعي',
      onClick: addSubAccount,
      icon: PlusCircle,
    },
    {
      label: 'تعطيل الحساب',
      onClick: disableAccount,
      icon: Ban,
      danger: true,
    },
  ];

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
            <button
              onClick={() => navigate('/link')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center gap-2"
            >
              <Link size={16} />
              ربط
            </button>
            <button
              onClick={() => navigate('new')}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <PlusIcon size={16} />
              انشاء
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <FolderTree size={20} />
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600 mb-1">إجمالي الحسابات</div>
            <div className="text-xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="mt-3 text-sm text-emerald-600 mb-1">نشطة</div>
            <div className="text-xl font-bold text-emerald-700">
              {stats.active}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <XCircle size={20} />
              </div>
            </div>
            <div className="mt-3 text-sm text-red-600 mb-1">غير نشطة</div>
            <div className="text-xl font-bold text-red-700">
              {stats.total - stats.active}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers size={20} />
              </div>
            </div>
            <div className="mt-3 text-sm text-primary mb-1">أنواع الحسابات</div>
            <div className="text-xl font-bold text-primary">
              {accountTypes.length}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterValue={filterType}
          onFilterChange={setFilterType}
          filterOptions={accountTypes}
          searchPlaceholder="ابحث عن حساب..."
          allLabel="جميع الأنواع"
        />
      </div>

      {/* Tree View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">عرض الشجرة</h2>
            <button
              onClick={() => setExpandedAll((prev) => !prev)}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              {expandedAll ? 'طي الكل' : 'توسيع الكل'}
            </button>
          </div>
        </div>

        <div className="p-4 max-h-150 overflow-y-auto">
          {rootsLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <RefreshCw size={24} className="animate-spin ml-2" />
              جاري تحميل الحسابات...
            </div>
          ) : isSearching ? (
            searchLoading && searchResults.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <RefreshCw size={24} className="animate-spin ml-2" />
                جاري البحث...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">لا توجد حسابات مطابقة للبحث</p>
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map((account) => (
                  <div
                    key={getAccountId(account)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                  >
                    <FileText size={18} className="shrink-0 text-gray-400" />
                    <span className="min-w-20 font-mono text-sm text-gray-500">
                      {account.accountCode}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium text-gray-900">
                      {account.nameAr || account.nameEn}
                    </span>
                    {account.accountType ? (
                      <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                        {account.accountType}
                      </span>
                    ) : null}
                    {account.lockedInJournal ? (
                      <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                        مقفل
                      </span>
                    ) : null}
                    <AccountActionsMenu node={account} actions={actions} />
                  </div>
                ))}
              </div>
            )
          ) : filteredTree.length > 0 ? (
            <div className="space-y-1">
              {filteredTree.map((account) => (
                <TreeNode
                  key={account.accountID}
                  node={account}
                  expandedAll={expandedAll}
                  getLabel={(a) => a.nameAr}
                  getCode={(a) => a.accountCode}
                  getChildren={(a) => a.children}
                  getParentId={(a) => a.parentId}
                  onExpand={handleExpand}
                  isLoading={isLoading}
                  actions={actions}
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
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDisable}
        title="تعطيل الحساب"
        description={`هل أنت متأكد من رغبتك في تعطيل الحساب: ${selectedNode?.nameAr || ''}؟`}
        confirmText="نعم، تعطيل"
        cancelText="إلغاء"
      />
    </div>
  );
};

export default AccountsTree;