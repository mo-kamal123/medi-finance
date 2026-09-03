import { useState } from 'react';
import { CalendarDays, FileText, Settings } from 'lucide-react';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import ChequeForm from '../components/cheque-form';

const TABS = [
  { key: 'info', label: 'بيانات الشيك', icon: FileText },
  { key: 'accounts', label: 'الحسابات', icon: CalendarDays },
  { key: 'settings', label: 'الخصائص والملاحظات', icon: Settings },
];

const NewCheque = () => {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb
        items={[
          { label: 'الشيكات', to: '/cheques' },
          { label: 'إضافة شيك' },
        ]}
      />

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
          <ChequeForm activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default NewCheque;
