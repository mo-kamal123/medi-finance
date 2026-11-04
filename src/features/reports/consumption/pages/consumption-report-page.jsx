import Breadcrumb from '../../../../shared/ui/breadcrumb';
import CustomerConsumptionPanel from '../../../master-data/customers/components/customer-consumption-panel';

const ConsumptionReportPage = () => (
  <div className="space-y-6 p-6">
    <Breadcrumb items={[{ label: 'تقرير الاستهلاكات' }]} />
    <h1 className="text-2xl font-bold text-gray-900">تقرير الاستهلاكات</h1>
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <CustomerConsumptionPanel />
    </div>
  </div>
);

export default ConsumptionReportPage;
