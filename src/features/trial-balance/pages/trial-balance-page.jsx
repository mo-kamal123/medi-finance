import Table from '../../../shared/ui/table';
import { useTrialBalance } from '../hooks/trial-balance.queries';

const TrialBalancePage = () => {
  //   const { data = [], isLoading } = useTrialBalance();
  const data = [
    {
      AccountID: 4,
      NameAr: 'الأصول',
      OpeningBalance: 0.0,
      PeriodDebit: 74970.0,
      PeriodCredit: 0.0,
      ClosingBalance: 74970.0,
    },
    {
      AccountID: 5,
      NameAr: 'الخصوم',
      OpeningBalance: 0.0,
      PeriodDebit: 0.0,
      PeriodCredit: 64250.0,
      ClosingBalance: -64250.0,
    },
    {
      AccountID: 7,
      NameAr: 'صافي الإيرادات',
      OpeningBalance: 0.0,
      PeriodDebit: 0.0,
      PeriodCredit: 73400.0,
      ClosingBalance: -73400.0,
    },
    {
      AccountID: 8,
      NameAr: 'المصروفات',
      OpeningBalance: 0.0,
      PeriodDebit: 65520.0,
      PeriodCredit: 0.0,
      ClosingBalance: 65520.0,
    },
    {
      AccountID: 9,
      NameAr: 'المصاريف الإدارية والعمومية',
      OpeningBalance: 0.0,
      PeriodDebit: 150.0,
      PeriodCredit: 1500.0,
      ClosingBalance: -1350.0,
    },
    {
      AccountID: 20,
      NameAr: 'خسائر تشغيل',
      OpeningBalance: 0.0,
      PeriodDebit: 2500.0,
      PeriodCredit: 4740.0,
      ClosingBalance: -2240.0,
    },
  ];
  const columns = [
    {
      header: 'الحساب',
      key: 'NameAr',
    },
    {
      header: 'الرصيد الافتتاحي',
      key: 'OpeningBalance',
    },
    {
      header: 'مدين الفترة',
      key: 'PeriodDebit',
    },
    {
      header: 'دائن الفترة',
      key: 'PeriodCredit',
    },
    {
      header: 'الرصيد الختامي',
      key: 'ClosingBalance',
    },
  ];

  const footer = (
    <tr>
      <td className="p-3 border border-gray-200">الإجمالي</td>
      <td className="p-3 border border-gray-200">
        {data.reduce((sum, row) => sum + row.OpeningBalance, 0)}
      </td>
      <td className="p-3 border border-gray-200">
        {data.reduce((sum, row) => sum + row.PeriodDebit, 0)}
      </td>
      <td className="p-3 border border-gray-200">
        {data.reduce((sum, row) => sum + row.PeriodCredit, 0)}
      </td>
      <td className="p-3 border border-gray-200">
        {data.reduce((sum, row) => sum + row.ClosingBalance, 0)}
      </td>
    </tr>
  );

  //   if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold">ميزان المراجعة</h1>
        <p className="text-sm text-gray-600 mt-1">
          عرض أرصدة الحسابات خلال الفترة مع إجمالي المدين والدائن والرصيد
          الختامي
        </p>
      </div>
      <Table columns={columns} data={data} footer={footer} />
    </div>
  );
};

export default TrialBalancePage;
