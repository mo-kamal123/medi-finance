import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Ban,
  FileText,
  FolderTree,
  // Link,
  Lock,
  Pencil,
  PlusIcon,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import TreeNode, { GRID_COLUMNS } from '../../components/tree-node';
import AccountActionsMenu from '../../components/account-actions-menu';
import { filterTree } from '../../utils/filterTree';
import SearchFilter from '../../../../../shared/components/search-filter';
import Breadcrumb from '../../../../../shared/ui/breadcrumb';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../../../shared/ui/modal';
import { useDebounce } from '../../../../../shared/lib/use-debounce';
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
  const expandedAll = null;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [childrenCache, setChildrenCache] = useState({});
  const [loadingNodes, setLoadingNodes] = useState({});
  const pendingRef = useRef({});

  const { data: roots = [], isLoading: rootsLoading } = useAccountRoots({
    isActive: true,
  });
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchQuery, 500);
  const isSearching = searchQuery.trim().length > 0;

  const { data: searchResults = [], isFetching: searchLoading } =
    useSearchAccounts({
      searchText: debouncedSearch,
      accountType: filterType,
    });

  const attachChildren = (nodes, cache) =>
    nodes.map((node) => ({
      ...node,
      children:
        node.hasChildren && cache[node.accountID]
          ? attachChildren(cache[node.accountID], cache)
          : (node.children ?? []),
    }));

  const treeWithChildren = useMemo(
    () => attachChildren(roots, childrenCache),
    [roots, childrenCache]
  );

  const allAccounts = useMemo(
    () => flattenTree(treeWithChildren),
    [treeWithChildren]
  );

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

  const isLoading = useCallback(
    (node) => !!loadingNodes[node.accountID],
    [loadingNodes]
  );

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
    <div className="space-y-6 p-6">
      <Breadcrumb items={[{ label: 'شجرة الحسابات' }]} />
      {/* Header */}
      <div className="bg-white rounded-xl p-6  border border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderTree size={20} aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold md:text-2xl">شجرة الحسابات</h1>
              <p className="text-gray-600 text-sm">
                عرض وإدارة جميع الحسابات المحاسبية
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* <button
              onClick={() => navigate('/link')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center gap-2"
            >
              <Link size={16} />
              ربط
            </button> */}
            <button
              onClick={() => navigate('new')}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <PlusIcon size={16} />
              انشاء
            </button>
          </div>
        </div>
      </div>
      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'إجمالي الحسابات',
            value: stats.total,
            color: 'text-gray-900',
          },
          { label: 'نشطة', value: stats.active, color: 'text-emerald-700' },
          {
            label: 'غير نشطة',
            value: stats.total - stats.active,
            color: 'text-red-600',
          },
          {
            label: 'أنواع الحسابات',
            value: accountTypes.length,
            color: 'text-primary',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="text-sm text-gray-500">{card.label}</div>
            <div className={`mt-2 text-lg font-semibold ${card.color}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>
      {/* Search and Filter */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
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
      <div className="bg-white rounded-xl  border border-gray-200 overflow-hidden">
        {/* Header Row */}
        <div className="max-h-150 overflow-auto">
          <div className="min-w-[620px]">
            <div
              className="sticky top-0 z-10 grid items-center bg-primary px-3 py-4 text-start text-sm font-semibold text-white select-none"
              style={{ gridTemplateColumns: GRID_COLUMNS }}
            >
              <span className="ps-[54px]">اسم الحساب</span>
              <span>الكود</span>
              <span>الحالة</span>
              <span>مقفل</span>
              <span>الإجراءات</span>
            </div>

            <div>
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
                  <div>
                    {searchResults.map((account) => (
                      <div
                        key={getAccountId(account)}
                        className="grid items-center border-b border-gray-200 py-4 px-3 hover:bg-gray-50 transition-colors"
                        style={{ gridTemplateColumns: GRID_COLUMNS }}
                      >
                        <div className="flex items-center gap-2 min-w-0 ps-7">
                          <FileText
                            size={18}
                            className="shrink-0 text-gray-400"
                          />
                          <span className="text-lg font-medium text-gray-900 truncate">
                            {account.nameAr || account.nameEn}
                          </span>
                        </div>
                        <span className="text-sm font-mono text-gray-500 truncate">
                          {account.accountCode}
                        </span>
                        <span
                          className={`text-sm font-medium ${account.isActive !== false ? 'text-emerald-600' : 'text-red-500'}`}
                        >
                          {account.isActive !== false ? 'نشط' : 'غير نشط'}
                        </span>
                        {account.lockedInJournal ? (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Lock size={12} />
                            <span className="text-[10px] font-semibold">
                              مقفل
                            </span>
                          </span>
                        ) : (
                          <span className="text-sm text-gray-300">-</span>
                        )}
                        <div
                          className="flex justify-start"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <AccountActionsMenu
                            node={account}
                            actions={actions}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : filteredTree.length > 0 ? (
                <div>
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
