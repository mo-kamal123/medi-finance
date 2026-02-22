import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'react-router-dom';

const ViewJournalEntryPage = () => {
  const { id } = useParams();
  const [entry, setEntry] = useState({
    journalEntryID: 12,
    journalEntryNumber: 'erwe',
    entryDate: '2022-01-01T00:00:00',
    journalType: '1',
    descriptionAr: 'sdf',
    descriptionEn: 'sdfs',
    referenceNumber: '23423',
    financialPeriodID: 1,
    totalDebit: 32,
    totalCredit: 232,
    isPosted: true,
    postedDate: '2002-01-01T00:00:00',
    isReversed: true,
    reversalEntryID: 1,
    status: '1',
    createdBy: 'msaad',
    createdAt: '2026-02-17T11:31:37.96',
    modifiedBy: null,
    modifiedAt: null,
    financialPeriodNameAr: 'elsana elgdida2',
    financialPeriodNameEn: 'new yr2',
    reversalEntryNumber: null,
    details: [
      {
        journalEntryDetailID: 2,
        journalEntryID: 12,
        accountID: 12,
        costCenterID: 8,
        debitAmount: 45,
        creditAmount: 45,
        descriptionAr: 'قيد توريد',
        descriptionEn: 'sfs',
        customerID: 1,
        supplierID: 1,
        currencyID: 1,
        exchangeRate: null,
        localDebitAmount: 34,
        localCreditAmount: 34,
        accountCode: '7003',
        accountNameAr: 'دعايه واعلان',
        accountNameEn: 'Advertising ??????',
        costCenterCode: '114',
        costCenterNameAr: 'الشؤون القانونية',
        costCenterNameEn: 'Legal Affairs',
        customerCode: '001',
        customerNameAr: 'lsjatd hg,c]',
        supplierCode: '001',
        supplierNameAr: 'wwwwwwdfgd',
        currencyCode: '001',
        currencyNameAr: 'gg',
      },
      {
        journalEntryDetailID: 3,
        journalEntryID: 12,
        accountID: 12,
        costCenterID: 8,
        debitAmount: 50,
        creditAmount: 50,
        descriptionAr: 'قيد شراء',
        descriptionEn: 'rwer',
        customerID: 1,
        supplierID: 1,
        currencyID: 1,
        exchangeRate: null,
        localDebitAmount: 0,
        localCreditAmount: 0,
        accountCode: '7003',
        accountNameAr: 'دعايه واعلان',
        accountNameEn: 'Advertising ??????',
        costCenterCode: '114',
        costCenterNameAr: 'الشؤون القانونية',
        costCenterNameEn: 'Legal Affairs',
        customerCode: '001',
        customerNameAr: 'lsjatd hg,c]',
        supplierCode: '001',
        supplierNameAr: 'wwwwwwdfgd',
        currencyCode: '001',
        currencyNameAr: 'gg',
      },
    ],
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <ArrowLeft className="cursor-pointer text-gray-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">عرض قيد يومي</h1>
          <p className="text-gray-600 text-sm">
            رقم القيد: {entry.journalEntryNumber}
          </p>
        </div>
      </div>

      {/* Entry Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="text-sm text-gray-500">التاريخ</label>
          <div className="mt-1 font-medium">
            {new Date(entry.entryDate).toLocaleDateString('ar-EG')}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500">الوصف</label>
          <div className="mt-1 font-medium">{entry.descriptionAr}</div>
        </div>

        <div>
          <label className="text-sm text-gray-500">الفترة المالية</label>
          <div className="mt-1 font-medium">{entry.financialPeriodNameAr}</div>
        </div>

        <div>
          <label className="text-sm text-gray-500">الحالة</label>
          <div
            className={`mt-1 px-3 py-1 inline-block rounded-full text-xs ${
              entry.isPosted
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {entry.isPosted ? 'مرحّل' : 'غير مرحّل'}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500">إجمالي مدين</label>
          <div className="mt-1 font-medium text-green-600">
            {entry.totalDebit} ر.س
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500">إجمالي دائن</label>
          <div className="mt-1 font-medium text-red-600">
            {entry.totalCredit} ر.س
          </div>
        </div>
      </div>

      {/* Details Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-3 text-right">الحساب</th>
              <th className="p-3 text-right">مركز التكلفة</th>
              <th className="p-3 text-right">الوصف</th>
              <th className="p-3 text-right">مدين</th>
              <th className="p-3 text-right">دائن</th>
            </tr>
          </thead>

          <tbody>
            {entry.details.map((detail) => (
              <tr key={detail.journalEntryDetailID} className="border-t">
                <td className="p-3">
                  {detail.accountCode} - {detail.accountNameAr}
                </td>
                <td className="p-3">{detail.costCenterNameAr}</td>
                <td className="p-3">{detail.descriptionAr}</td>
                <td className="p-3 text-green-600">{detail.debitAmount}</td>
                <td className="p-3 text-red-600">{detail.creditAmount}</td>
              </tr>
            ))}
          </tbody>

          <tfoot className="bg-gray-50 font-semibold">
            <tr>
              <td colSpan="3" className="p-3 text-right">
                الإجمالي
              </td>
              <td className="p-3 text-green-600">{entry.totalDebit}</td>
              <td className="p-3 text-red-600">{entry.totalCredit}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ViewJournalEntryPage;
