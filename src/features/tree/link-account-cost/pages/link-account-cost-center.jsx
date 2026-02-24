import { useState, useMemo } from 'react';
import useCostTree from '../../cost-tree/hooks/use-cost-tree';
import useAccountsTree from '../../accouts-tree/hooks/use-accounts-tree';
import SearchFilter from '../../../../shared/components/search-filter';
import { buildTree } from '../../utils/buildTree';
import useLinkAccountCostCenter from '../hooks/use-link';

const LinkAccountCostCenter = () => {
  const [searchAccount, setSearchAccount] = useState('');
  const [searchCost, setSearchCost] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedCost, setSelectedCost] = useState(null);

  const { data: costTree = [] } = useCostTree();
  const { data: accountsTree = [] } = useAccountsTree();

  const {mutate, isLoading} = useLinkAccountCostCenter();

  // Build trees
  const accountTreeData = useMemo(
    () => buildTree(accountsTree, { idKey: 'accountID', parentKey: 'parentID', sortKey: 'accountCode' }),
    [accountsTree]
  );

  const costTreeData = useMemo(
    () => buildTree(costTree, { idKey: 'costCenterID', parentKey: 'parentID', sortKey: 'ccCode' }),
    [costTree]
  );

  const getFinalNodes = (nodes) => {
    let finalNodes = [];
    nodes.forEach((node) => {
      if (node.isFinal) finalNodes.push(node);
      if (node.children?.length) finalNodes = finalNodes.concat(getFinalNodes(node.children));
    });
    return finalNodes;
  };

  const filteredAccounts = useMemo(() => {
    return getFinalNodes(accountTreeData).filter((a) =>
      a.nameAr.toLowerCase().includes(searchAccount.toLowerCase())
    );
  }, [accountTreeData, searchAccount]);

  const filteredCosts = useMemo(() => {
    return getFinalNodes(costTreeData).filter((c) =>
      c.nameAr.toLowerCase().includes(searchCost.toLowerCase())
    );
  }, [costTreeData, searchCost]);

  // Handle link
  const handleLink = () => {
    if (!selectedAccount || !selectedCost) {
      alert('يرجى اختيار الحساب والمركز قبل الربط!');
      return;
    }

    const body = {
      accountID: selectedAccount.accountID,
      costCenterID: selectedCost.costCenterID,
      percentage: 100,
      isActive: true,
      action: 'ADD',
    };

    mutate(body);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          ربط الحسابات بمراكز التكلفة
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Accounts */}
          <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
            <h2 className="text-lg font-semibold mb-2">اختيار الحساب</h2>
            <SearchFilter searchQuery={searchAccount} onSearchChange={setSearchAccount} searchPlaceholder="ابحث عن حساب..." />
            <div className="h-72 overflow-y-auto mt-2 border border-gray-300 rounded-lg p-2 bg-white">
              {filteredAccounts.length > 0 ? filteredAccounts.map((acc) => (
                <div
                  key={acc.accountID}
                  onClick={() => setSelectedAccount(acc)}
                  className={`p-2 rounded-md cursor-pointer hover:bg-primary/10 ${selectedAccount?.accountID === acc.accountID ? 'bg-primary/20' : ''}`}
                >
                  {acc.nameAr} - {acc.accountCode}
                </div>
              )) : <p className="text-gray-500 text-center py-4">لا توجد حسابات نهائية</p>}
            </div>
          </div>

          {/* Costs */}
          <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
            <h2 className="text-lg font-semibold mb-2">اختيار مركز التكلفة</h2>
            <SearchFilter searchQuery={searchCost} onSearchChange={setSearchCost} searchPlaceholder="ابحث عن مركز..." />
            <div className="h-72 overflow-y-auto mt-2 border border-gray-300 rounded-lg p-2 bg-white">
              {filteredCosts.length > 0 ? filteredCosts.map((c) => (
                <div
                  key={c.costCenterID}
                  onClick={() => setSelectedCost(c)}
                  className={`p-2 rounded-md cursor-pointer hover:bg-primary/10 ${selectedCost?.costCenterID === c.costCenterID ? 'bg-primary/20' : ''}`}
                >
                  {c.nameAr} - {c.ccCode}
                </div>
              )) : <p className="text-gray-500 text-center py-4">لا توجد مراكز نهائية</p>}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleLink}
            disabled={isLoading}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium disabled:opacity-60"
          >
            {isLoading ? 'جاري الربط...' : 'ربط الحساب بالمركز'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkAccountCostCenter;