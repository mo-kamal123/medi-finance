import { useGeneralLedger } from '../hooks/general-ledger.queries';
import GeneralLedgerTable from '../components/general-ledger-table';
import GeneralLedgerFilter from '../components/general-ledger-filter';
import { useState } from 'react';

const GeneralLedgerPage = () => {
  //   const { data, isLoading } = useGeneralLedger();
  const [filters, setFilters] = useState({});

  const data = [
    {
      AccountID: 4,
      EntryDate: '2026-02-23',
      JournalEntryNumber: 'JE-20260223-0001',
      DebitAmount: 1140.0,
      CreditAmount: 0.0,
      RunningBalance: 1140.0,
    },
    {
      AccountID: 4,
      EntryDate: '2026-02-23',
      JournalEntryNumber: 'JE-20260223-0004',
      DebitAmount: 1140.0,
      CreditAmount: 0.0,
      RunningBalance: 2280.0,
    },
    {
      AccountID: 4,
      EntryDate: '2026-02-23',
      JournalEntryNumber: 'JE-20260223-0005',
      DebitAmount: 1140.0,
      CreditAmount: 0.0,
      RunningBalance: 3420.0,
    },
    {
      AccountID: 4,
      EntryDate: '2026-02-23',
      JournalEntryNumber: 'JE-20260223-0007',
      DebitAmount: 13600.0,
      CreditAmount: 0.0,
      RunningBalance: 17020.0,
    },
    {
      AccountID: 4,
      EntryDate: '2026-02-23',
      JournalEntryNumber: 'JE-20260223-0009',
      DebitAmount: 1140.0,
      CreditAmount: 0.0,
      RunningBalance: 18160.0,
    },
    {
      AccountID: 4,
      EntryDate: '2026-02-23',
      JournalEntryNumber: 'JE-20260224-0001',
      DebitAmount: 1140.0,
      CreditAmount: 0.0,
      RunningBalance: 19300.0,
    },
    {
      AccountID: 4,
      EntryDate: '2026-02-23',
      JournalEntryNumber: 'JE-20260224-0002',
      DebitAmount: 1140.0,
      CreditAmount: 0.0,
      RunningBalance: 20440.0,
    },
    {
      AccountID: 4,
      EntryDate: '2026-02-23',
      JournalEntryNumber: 'JE-20260224-0003',
      DebitAmount: 13600.0,
      CreditAmount: 0.0,
      RunningBalance: 34040.0,
    },
    {
      AccountID: 4,
      EntryDate: '2026-02-24',
      JournalEntryNumber: 'JE-20260224-0005',
      DebitAmount: 11630.0,
      CreditAmount: 0.0,
      RunningBalance: 45670.0,
    },
    {
      AccountID: 4,
      EntryDate: '2026-02-24',
      JournalEntryNumber: 'JE-20260224-0004',
      DebitAmount: 29300.0,
      CreditAmount: 0.0,
      RunningBalance: 74970.0,
    },
    {
      AccountID: 5,
      EntryDate: '2026-02-23',
      JournalEntryNumber: 'JE-20260223-0002',
      DebitAmount: 0.0,
      CreditAmount: 1000.0,
      RunningBalance: -1000.0,
    },
    {
      AccountID: 5,
      EntryDate: '2026-02-23',
      JournalEntryNumber: 'JE-20260223-0003',
      DebitAmount: 0.0,
      CreditAmount: 1000.0,
      RunningBalance: -2000.0,
    },
    {
      AccountID: 5,
      EntryDate: '2026-02-23',
      JournalEntryNumber: 'JE-20260223-0006',
      DebitAmount: 0.0,
      CreditAmount: 1000.0,
      RunningBalance: -3000.0,
    },
    {
      AccountID: 5,
      EntryDate: '2026-02-23',
      JournalEntryNumber: 'JE-20260223-0008',
      DebitAmount: 0.0,
      CreditAmount: 61250.0,
      RunningBalance: -64250.0,
    },
  ];
  //   if (isLoading) return <div>Loading...</div>;
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold">دفتر الأستاذ العام</h1>
        <p className="text-sm text-gray-600 mt-1">
          عرض الحركات المحاسبية مجمعة حسب الحساب مع الرصيد الجاري
        </p>
      </div>

      {/* Filters */}
      <GeneralLedgerFilter onFilter={setFilters} />

      {/* Table */}
      {!data ? (
        <div>جاري التحميل...</div>
      ) : (
        <GeneralLedgerTable data={data || []} />
      )}
    </div>
  );
};

export default GeneralLedgerPage;
