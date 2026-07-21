import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  Loader2,
  RefreshCw,
  Download,
} from 'lucide-react';
import DateInput from '../../../shared/ui/date-input';
import FormInput from '../../../shared/ui/input';
import { formatCurrency } from '../../../shared/utils/formatters';
import { useFinancialPeriods } from '../../invoices/hooks/invoices.queries';
import { useTrialBalanceRoots } from '../hooks/trial-balance.queries';
import { getTrialBalanceChildren } from '../api/trial-balance.api';
import { useTrialBalanceExport } from '../hooks/use-trial-balance-export';

const TrialBalanceRow = ({
  node,
  level = 0,
  expandedNodes,
  loadingNodes,
  onToggle,
}) => {
  const id = node.accountID;
  const isExpanded = expandedNodes[id];
  const isLoading = loadingNodes[id];
  const hasChildren = node.hasChildren;
  const children = node.children ?? [];

  return (
    <>
      <tr
        className={`border-b border-gray-100 transition-colors ${
          level === 0 ? 'bg-primary/[0.02]' : level === 1 ? 'bg-white' : 'bg-gray-50/30'
        } ${hasChildren ? 'cursor-pointer hover:bg-primary/5' : 'hover:bg-gray-50/50'}`}
        onClick={() => hasChildren && onToggle(node)}
      >
        <td className="px-4 py-3.5" style={{ paddingRight: `${level * 28 + 12}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <span className="w-5 h-5 flex items-center justify-center shrink-0 rounded bg-gray-100">
                {isLoading ? (
                  <Loader2 size={13} className="animate-spin text-primary" />
                ) : isExpanded ? (
                  <ChevronDown size={13} className="text-gray-500" />
                ) : (
                  <ChevronLeft size={13} className="text-gray-500" />
                )}
              </span>
            ) : (
              <span className="w-5 h-5 shrink-0 rounded bg-gray-50 flex items-center justify-center" />
            )}
            <span className={`font-mono shrink-0 min-w-16 ${
              level === 0 ? 'text-sm font-bold text-gray-600' : 'text-xs text-gray-500'
            }`}>
              {node.accountCode}
            </span>
            <span className={`truncate ${
              level === 0
                ? 'text-sm font-bold text-gray-900'
                : 'text-sm text-gray-700'
            }`}>
              {node.accountNameAr || node.accountNameEn}
            </span>
          </div>
        </td>
        <td className="px-4 py-3.5 text-sm font-semibold text-emerald-700 text-left whitespace-nowrap" dir="ltr">
          {node.aggregatedDebit ? formatCurrency(node.aggregatedDebit) : '-'}
        </td>
        <td className="px-4 py-3.5 text-sm font-semibold text-red-700 text-left whitespace-nowrap" dir="ltr">
          {node.aggregatedCredit ? formatCurrency(node.aggregatedCredit) : '-'}
        </td>
      </tr>
      {hasChildren && isExpanded && children.length > 0 && (
        <>
          {children.map((child) => (
            <TrialBalanceRow
              key={child.accountID}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              loadingNodes={loadingNodes}
              onToggle={onToggle}
            />
          ))}
        </>
      )}
    </>
  );
};

const TrialBalancePage = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    financialPeriodId: '',
  });

  const { data: financialPeriods = [] } = useFinancialPeriods();
  const { data: rootsResponse, isLoading } = useTrialBalanceRoots(filters);
  const { handleExport, isExporting } = useTrialBalanceExport();

  const roots = useMemo(() => rootsResponse?.accounts ?? [], [rootsResponse]);
  const totalAggregatedDebit = useMemo(() => Number(rootsResponse?.totalAggregatedDebit) || 0, [rootsResponse]);
  const totalAggregatedCredit = useMemo(() => Number(rootsResponse?.totalAggregatedCredit) || 0, [rootsResponse]);

  const [expandedNodes, setExpandedNodes] = useState({});
  const [loadingNodes, setLoadingNodes] = useState({});
  const [childrenCache, setChildrenCache] = useState({});
  const pendingRef = useRef({});

  const attachChildren = (nodes, cache) =>
    nodes.map((node) => ({
      ...node,
      children: node.hasChildren && cache[node.accountID]
        ? attachChildren(cache[node.accountID], cache)
        : [],
    }));

  const treeData = useMemo(
    () => attachChildren(roots, childrenCache),
    [roots, childrenCache]
  );

  const walk = useCallback((nodes, result = []) => {
    for (const n of nodes) {
      result.push(n);
      if (n.children?.length) walk(n.children, result);
    }
    return result;
  }, []);

  const allAccounts = useMemo(() => walk(treeData), [treeData, walk]);

  const handleToggle = useCallback(
    async (node) => {
      const id = node.accountID;
      if (expandedNodes[id]) {
        setExpandedNodes((prev) => ({ ...prev, [id]: false }));
        return;
      }
      if (!node.hasChildren) return;
      if (pendingRef.current[id]) return;

      pendingRef.current[id] = true;
      setLoadingNodes((prev) => ({ ...prev, [id]: true }));
      try {
        const data = await getTrialBalanceChildren(id, filters);
        setChildrenCache((prev) => ({ ...prev, [id]: data }));
        setExpandedNodes((prev) => ({ ...prev, [id]: true }));
      } finally {
        setLoadingNodes((prev) => ({ ...prev, [id]: false }));
        delete pendingRef.current[id];
      }
    },
    [expandedNodes, filters]
  );

  const handleExpandAll = () => {
    setExpandedNodes((prev) => {
      const allTrue = {};
      const expandRecursive = (nodes) => {
        nodes.forEach((n) => {
          if (n.hasChildren) {
            allTrue[n.accountID] = true;
            if (n.children?.length) expandRecursive(n.children);
          }
        });
      };
      expandRecursive(treeData);
      return allTrue;
    });
  };

  const handleCollapseAll = () => {
    setExpandedNodes({});
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ميزان المراجعة</h1>
            <p className="mt-1 text-sm text-gray-600">
              عرض أرصدة الحسابات خلال الفترة مع إجمالي المدين والدائن والرصيد الختامي
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleExport(filters)}
          disabled={isExporting}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Download size={16} />
          {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-3">
        <DateInput
          label="من تاريخ"
          value={filters.fromDate}
          onChange={({ target: { value } }) =>
            setFilters((prev) => ({ ...prev, fromDate: value }))
          }
        />
        <DateInput
          label="إلى تاريخ"
          value={filters.toDate}
          onChange={({ target: { value } }) =>
            setFilters((prev) => ({ ...prev, toDate: value }))
          }
        />
        <FormInput
          as="select"
          label="الفترة المالية"
          value={filters.financialPeriodId}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              financialPeriodId: e.target.value,
            }))
          }
        >
          <option value="">كل الفترات</option>
          {financialPeriods.map((period) => (
            <option
              key={period.financialPeriodID}
              value={period.financialPeriodID}
            >
              {period.nameAr || period.financialPeriodNameAr || period.nameEn}
            </option>
          ))}
        </FormInput>

      </div>

      {/* Tree Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-l from-primary/5 via-primary/[0.02] to-transparent px-6 py-3.5">
          <h2 className="text-sm font-semibold text-gray-700">
            ميزان المراجعة
            <span className="mr-2 text-gray-400 font-normal">
              ({allAccounts.length} حساب)
            </span>
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExpandAll}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              توسيع الكل
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleCollapseAll}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              طي الكل
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <RefreshCw size={24} className="animate-spin ml-2" />
            جاري تحميل ميزان المراجعة...
          </div>
        ) : treeData.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            لا توجد بيانات لعرضها
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-primary to-primary/90 text-white">
                  <th className="px-4 py-3.5 text-right font-semibold">الحساب</th>
                  <th className="px-4 py-3.5 text-left font-semibold">مدين</th>
                  <th className="px-4 py-3.5 text-left font-semibold">دائن</th>
                </tr>
              </thead>
              <tbody>
                {treeData.map((root) => (
                  <TrialBalanceRow
                    key={root.accountID}
                    node={root}
                    level={0}
                    expandedNodes={expandedNodes}
                    loadingNodes={loadingNodes}
                    onToggle={handleToggle}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-l from-primary/10 to-primary/5 border-t-2 border-primary/20">
                  <td className="px-4 py-4 text-right font-bold text-gray-900 text-base">
                    الإجمالي
                  </td>
                  <td className="px-4 py-4 text-left font-bold text-emerald-700 text-base" dir="ltr">
                    {formatCurrency(totalAggregatedDebit)}
                  </td>
                  <td className="px-4 py-4 text-left font-bold text-red-700 text-base" dir="ltr">
                    {formatCurrency(totalAggregatedCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrialBalancePage;
