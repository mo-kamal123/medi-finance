import { useState, useMemo } from 'react';
import { PlusIcon, Download } from 'lucide-react';
import { accountsTree, costTree } from '../../utils/constants';
import { buildTree } from '../../utils/buildTree';
import TreeNode from '../../components/tree-node';
import SearchFilter from '../../../../shared/components/search-filter';

const LinkAccountCostCenter = () => {
  const [searchAccount, setSearchAccount] = useState('');
  const [searchCost, setSearchCost] = useState('');
  const [filterAccountType, setFilterAccountType] = useState('all');
  const [filterCostType, setFilterCostType] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedCost, setSelectedCost] = useState(null);

  // بناء الأشجار
  const accountTreeData = useMemo(
    () =>
      buildTree(accountsTree, {
        idKey: 'accountID',
        parentKey: 'parentID',
        sortKey: 'accountCode',
      }),
    []
  );

  const costTreeData = useMemo(
    () =>
      buildTree(costTree, {
        idKey: 'costCenterID',
        parentKey: 'parentID',
        sortKey: 'ccCode',
      }),
    []
  );

  // أنواع الحسابات والمراكز
  const accountTypes = useMemo(() => {
    const types = new Set(accountsTree.map((a) => a.accountType));
    return Array.from(types).sort();
  }, []);

  const costTypes = useMemo(() => {
    const types = new Set(costTree.map((c) => c.costCenterType || 'عام'));
    return Array.from(types).sort();
  }, []);

  // تصفية الأشجار حسب البحث والفلتر
  const filteredAccounts = useMemo(() => {
    return accountTreeData.filter((a) =>
      a.nameAr.toLowerCase().includes(searchAccount.toLowerCase())
    );
  }, [accountTreeData, searchAccount]);

  const filteredCosts = useMemo(() => {
    return costTreeData.filter((c) =>
      c.nameAr.toLowerCase().includes(searchCost.toLowerCase())
    );
  }, [costTreeData, searchCost]);

  // ربط الحساب بالمركز
  const handleLink = () => {
    if (!selectedAccount || !selectedCost) {
      alert('يرجى اختيار الحساب والمركز قبل الربط!');
      return;
    }
    console.log(
      'تم ربط الحساب:',
      selectedAccount.nameAr,
      'بالمركز:',
      selectedCost.nameAr
    );
    // هنا استدعاء API لعمل الربط
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              ربط الحسابات بمراكز التكلفة
            </h1>
            <p className="text-gray-600 text-sm">
              اختر الحساب والمركز لعمل الربط بينهما
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2">
              <Download size={16} />
              تصدير
            </button>
          </div>
        </div>

        {/* اختيار الحساب */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              اختيار الحساب
            </h2>
            <SearchFilter
              searchQuery={searchAccount}
              onSearchChange={setSearchAccount}
              filterValue={filterAccountType}
              onFilterChange={setFilterAccountType}
              filterOptions={accountTypes}
              searchPlaceholder="ابحث عن حساب..."
              allLabel="جميع الأنواع"
            />
            <div className="max-h-72 overflow-y-auto mt-2 border border-gray-200 rounded-lg p-2 bg-white">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((acc) => (
                  <div
                    key={acc.accountID}
                    onClick={() => setSelectedAccount(acc)}
                    className={`p-2 rounded-md cursor-pointer hover:bg-primary/10 ${
                      selectedAccount?.accountID === acc.accountID
                        ? 'bg-primary/20'
                        : ''
                    }`}
                  >
                    {acc.nameAr} - {acc.accountCode}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد حسابات</p>
              )}
            </div>
          </div>

          {/* اختيار المركز */}
          <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              اختيار مركز التكلفة
            </h2>
            <SearchFilter
              searchQuery={searchCost}
              onSearchChange={setSearchCost}
              filterValue={filterCostType}
              onFilterChange={setFilterCostType}
              filterOptions={costTypes}
              searchPlaceholder="ابحث عن مركز..."
              allLabel="جميع الأنواع"
            />
            <div className="max-h-72 overflow-y-auto mt-2 border border-gray-200 rounded-lg p-2 bg-white">
              {filteredCosts.length > 0 ? (
                filteredCosts.map((c) => (
                  <div
                    key={c.costCenterID}
                    onClick={() => setSelectedCost(c)}
                    className={`p-2 rounded-md cursor-pointer hover:bg-primary/10 ${
                      selectedCost?.costCenterID === c.costCenterID
                        ? 'bg-primary/20'
                        : ''
                    }`}
                  >
                    {c.nameAr} - {c.ccCode}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد مراكز</p>
              )}
            </div>
          </div>
        </div>

        {/* زر الربط */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleLink}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
          >
            ربط الحساب بالمركز
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkAccountCostCenter;
