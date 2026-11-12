import { useState } from 'react';
import { FileText, Settings } from 'lucide-react';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import ChequeForm from '../components/cheque-form';

const TABS = [
  { key: 'info', label: 'بيانات الشيك', icon: FileText },
  { key: 'settings', label: 'الخصائص والملاحظات', icon: Settings },
];

const NewCheque = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [isBatchPayment, setIsBatchPayment] = useState(false);
  const [invoiceSelectionContainer, setInvoiceSelectionContainer] = useState(null);

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb
        items={[
          { label: 'الشيكات', to: '/cheques' },
          { label: 'إضافة شيك' },
        ]}
      />
      <div ref={setInvoiceSelectionContainer} className="empty:hidden" />
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 px-4 pt-3">
          {TABS.filter((tab) => !isBatchPayment || tab.key === 'info').map((tab) => {
            const Icon = tab.icon;
            const isActive = (isBatchPayment ? 'info' : activeTab) === tab.key;
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
          <ChequeForm activeTab={isBatchPayment ? 'info' : activeTab} invoiceSelectionContainer={invoiceSelectionContainer} onBatchModeChange={setIsBatchPayment} />
        </div>
      </div>
    </div>
  );
};

export default NewCheque;
