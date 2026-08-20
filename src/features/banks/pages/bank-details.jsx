import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, BookOpen, Receipt, Wallet } from 'lucide-react';
import PageLoader from '../../../shared/ui/page-loader';
import Breadcrumb from '../../../shared/ui/breadcrumb';
import BankAccountsPanel from '../components/bank-accounts-panel';
import BankForm from '../components/bank-form';
import BankTransactionsPanel from '../components/bank-transactions-panel';
import { useBank } from '../hooks/banks.queries';

const TABS = [
  { key: 'info', label: 'معلومات البنك', icon: Building2 },
  { key: 'accounts', label: 'حسابات البنك', icon: Wallet },
  { key: 'transactions', label: 'معاملات البنك', icon: Receipt },
];

const BankDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useBank(id);
  const [activeTab, setActiveTab] = useState('info');

  if (isLoading) {
    return <PageLoader label="جاري تحميل بيانات البنك..." />;
  }

  if (!data) {
    return <div>لا توجد بيانات.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb
        items={[
          { label: 'البنوك', to: '/banks' },
          { label: data.bankNameAr || 'تفاصيل البنك' },
        ]}
      />

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="bg-linear-to-r from-primary to-primary/80 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
                <span className="text-2xl font-bold">
                  {data.bankNameAr?.[0]}
                </span>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{data.bankNameAr}</h1>
                <p className="mt-0.5 text-white/70">{data.bankNameEn}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {data.accountID && (
                <button
                  onClick={() => navigate(`/general-ledger?accountId=${data.accountID}`)}
                  className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
                >
                  <BookOpen size={16} />
                  دفتر الأستاذ
                </button>
              )}
              <button
                onClick={() => navigate('/banks')}
                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
              >
                العودة إلى البنوك
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-4 pt-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-base font-medium transition-colors ${
                  isActive
                    ? 'border-b-2 border-primary bg-primary/5 text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <BankForm defaultValues={data} mode="edit" />
          )}
          {activeTab === 'accounts' && (
            <BankAccountsPanel bankId={id} />
          )}
          {activeTab === 'transactions' && (
            <BankTransactionsPanel />
          )}
        </div>
      </div>
    </div>
  );
};

export default BankDetails;
