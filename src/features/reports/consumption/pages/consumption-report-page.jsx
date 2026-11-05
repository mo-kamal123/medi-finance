import Breadcrumb from '../../../../shared/ui/breadcrumb';
import { FileSpreadsheet } from 'lucide-react';
import CustomerConsumptionPanel from '../../../master-data/customers/components/customer-consumption-panel';

const ConsumptionReportPage = () => (
  <div className="space-y-6 p-6">
    <Breadcrumb items={[{ label: 'تقرير الاستهلاكات' }]} />
    <header className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FileSpreadsheet size={20} aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">تقرير الاستهلاكات</h1>
        <p className="mt-1 text-sm text-gray-500">تحميل تقرير استهلاكات العميل حسب الوثيقة والفترة المحددة</p>
      </div>
    </header>
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <CustomerConsumptionPanel />
    </div>
  </div>
);

export default ConsumptionReportPage;
