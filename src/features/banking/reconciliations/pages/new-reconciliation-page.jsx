import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import Breadcrumb from '../../../../shared/ui/breadcrumb';
import Table from '../../../../shared/ui/table';
import FormInput from '../../../../shared/ui/input';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import DateInput from '../../../../shared/ui/date-input';
import { getErrorMessage } from '../../../../shared/lib/toast';
import { useBanks, useAllBankAccounts } from '../../banks/hooks/banks.queries';
import { useCurrencies } from '../../../transactions/commercial-papers/hooks/commercial-papers.queries';
import { useCreateBankReconciliation } from '../hooks/bank-reconciliations.mutations';

const EMPTY_ROW = {
  transactionDate: '',
  reference: '',
  externalReference: '',
  description: '',
  debit: '',
  credit: '',
  amount: '',
  balance: '',
};

const toNumberOrUndefined = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

const extractAccounts = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.items)) return res.items;
  return [];
};

const NewReconciliationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetBankId = searchParams.get('bankId') || '';
  const presetAccountId = searchParams.get('bankAccountId') || '';

  const [form, setForm] = useState({
    bankId: presetBankId,
    bankAccountId: presetAccountId,
    currencyId: '',
    fromDate: '',
    toDate: '',
    statementDate: '',
    statementBalance: '',
    bankStatementClosingBalance: '',
    notes: '',
  });
  const [rows, setRows] = useState([{ ...EMPTY_ROW }]);
  const [formError, setFormError] = useState('');

  const { data: banksRes = [] } = useBanks({});
  const { data: accountsRes } = useAllBankAccounts();
  const { data: currencies = [] } = useCurrencies();
  const createMutation = useCreateBankReconciliation();

  const banks = useMemo(
    () => (Array.isArray(banksRes) ? banksRes : []),
    [banksRes]
  );
  const allAccounts = useMemo(
    () => extractAccounts(accountsRes),
    [accountsRes]
  );

  const bankOptions = useMemo(
    () =>
      banks.map((b) => ({
        value: String(b.bankID ?? b.id),
        label: b.bankNameAr || b.bankNameEn || String(b.bankID ?? b.id),
      })),
    [banks]
  );

  const filteredAccounts = useMemo(() => {
    if (!form.bankId) return allAccounts;
    return allAccounts.filter(
      (a) => String(a.bankID ?? a.bankId ?? '') === String(form.bankId)
    );
  }, [allAccounts, form.bankId]);

  const accountOptions = useMemo(
    () =>
      filteredAccounts.map((a) => ({
        value: String(a.bankAccountID ?? a.id),
        label:
          a.accountNumberWithBranch ||
          [a.accountNumber, a.accountNameAr].filter(Boolean).join(' - ') ||
          String(a.bankAccountID ?? a.id),
      })),
    [filteredAccounts]
  );

  const currencyOptions = useMemo(
    () =>
      (Array.isArray(currencies) ? currencies : []).map((c) => ({
        value: String(c.currencyID),
        label: c.currencyNameAr || c.currencyNameEn || c.currencyCode,
      })),
    [currencies]
  );

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'bankId' ? { bankAccountId: '' } : {}),
    }));
  };

  const handleRowChange = (index, key, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    );
  };

  const handleAddRow = () => setRows((prev) => [...prev, { ...EMPTY_ROW }]);

  const handleDeleteRow = (index) =>
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
    );

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => ({
        debit: acc.debit + (Number(row.debit) || 0),
        credit: acc.credit + (Number(row.credit) || 0),
        amount: acc.amount + (Number(row.amount) || 0),
        balance: acc.balance + (Number(row.balance) || 0),
      }),
      { debit: 0, credit: 0, amount: 0, balance: 0 }
    );
  }, [rows]);

  const statementColumns = useMemo(
    () => [
      {
        header: 'تاريخ الحركة',
        key: 'transactionDate',
        type: 'custom',
        render: (row, rowIndex) => (
          <DateInput
            value={row.transactionDate || ''}
            onChange={(e) => handleRowChange(rowIndex, 'transactionDate', e.target.value)}
          />
        ),
      },
      { header: 'المرجع', key: 'reference', type: 'text' },
      { header: 'المرجع الخارجي', key: 'externalReference', type: 'text' },
      { header: 'الوصف', key: 'description', type: 'text' },
      { header: 'مدين (خارج)', key: 'debit', type: 'number' },
      { header: 'دائن (داخل)', key: 'credit', type: 'number' },
      { header: 'المبلغ', key: 'amount', type: 'number' },
      { header: 'الرصيد', key: 'balance', type: 'number' },
    ],
    []
  );

  const statementFooter = (
    <tr>
      <td className="p-3 text-center font-bold text-gray-900">الإجمالي</td>
      <td />
      <td />
      <td />
      <td className="p-3 text-center font-bold text-red-600" dir="ltr">
        {totals.debit.toFixed(2)}
      </td>
      <td className="p-3 text-center font-bold text-emerald-700" dir="ltr">
        {totals.credit.toFixed(2)}
      </td>
      <td className="p-3 text-center font-bold text-gray-900" dir="ltr">
        {totals.amount.toFixed(2)}
      </td>
      <td className="p-3 text-center font-bold text-gray-900" dir="ltr">
        {totals.balance.toFixed(2)}
      </td>
      <td />
    </tr>
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!form.bankAccountId) {
      setFormError('الحساب البنكي مطلوب');
      return;
    }

    const statementTransactions = rows
      .filter(
        (row) =>
          row.transactionDate ||
          row.reference ||
          row.externalReference ||
          row.description ||
          row.debit !== '' ||
          row.credit !== '' ||
          row.amount !== '' ||
          row.balance !== ''
      )
      .map((row) => ({
        transactionDate: row.transactionDate || undefined,
        reference: row.reference || undefined,
        externalReference: row.externalReference || undefined,
        description: row.description || undefined,
        debit: toNumberOrUndefined(row.debit),
        credit: toNumberOrUndefined(row.credit),
        amount: toNumberOrUndefined(row.amount),
        balance: toNumberOrUndefined(row.balance),
      }));

    const payload = {
      bankAccountId: Number(form.bankAccountId),
      currencyId: form.currencyId ? Number(form.currencyId) : undefined,
      fromDate: form.fromDate || undefined,
      toDate: form.toDate || undefined,
      statementDate: form.statementDate || undefined,
      statementBalance: toNumberOrUndefined(form.statementBalance),
      bankStatementClosingBalance: toNumberOrUndefined(
        form.bankStatementClosingBalance
      ),
      notes: form.notes || undefined,
      statementTransactions,
    };

    try {
      const created = await createMutation.mutateAsync(payload);
      const createdId =
        created?.id ?? created?.reconciliationId ?? created?.reconciliationID;
      if (createdId && typeof createdId !== 'object') {
        navigate(`/reconciliations/${createdId}`);
      } else {
        navigate('/reconciliations');
      }
    } catch (error) {
      setFormError(getErrorMessage(error, 'تعذر إنشاء التسوية'));
    }
  };

  return (
    <div className="space-y-4 p-6">
      <Breadcrumb
        items={[
          { label: 'البنوك' },
          { label: 'تسويات البنك', to: '/reconciliations' },
          { label: 'تسوية جديدة' },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            إنشاء تسوية بنك جديدة
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            أدخل فترة التسوية ورصيد كشف البنك ثم أضف حركات الكشف المستوردة
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/reconciliations')}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:border-primary/40 hover:text-primary"
        >
          <ArrowRight size={16} />
          رجوع للقائمة
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SearchableSelect
            label="البنك"
            value={form.bankId}
            onChange={(e) => handleChange('bankId', e.target.value)}
            options={bankOptions}
            placeholder="اختر البنك"
          />
          <SearchableSelect
            label="الحساب البنكي *"
            value={form.bankAccountId}
            onChange={(e) => handleChange('bankAccountId', e.target.value)}
            options={accountOptions}
            placeholder="اختر الحساب"
          />
          <SearchableSelect
            label="العملة"
            value={form.currencyId}
            onChange={(e) => handleChange('currencyId', e.target.value)}
            options={currencyOptions}
            placeholder="اختر العملة"
          />
          <DateInput
            label="من تاريخ"
            value={form.fromDate}
            onChange={(e) => handleChange('fromDate', e.target.value)}
          />
          <DateInput
            label="إلى تاريخ"
            value={form.toDate}
            onChange={(e) => handleChange('toDate', e.target.value)}
          />
          <DateInput
            label="تاريخ الكشف"
            value={form.statementDate}
            onChange={(e) => handleChange('statementDate', e.target.value)}
          />
          <FormInput
            label="رصيد الكشف (Statement Balance)"
            type="number"
            value={form.statementBalance}
            onChange={(e) => handleChange('statementBalance', e.target.value)}
            placeholder="0"
          />
          <FormInput
            label="رصيد كشف البنك النهائي"
            type="number"
            value={form.bankStatementClosingBalance}
            onChange={(e) =>
              handleChange('bankStatementClosingBalance', e.target.value)
            }
            placeholder="0"
          />
        </div>

        <FormInput
          label="ملاحظات"
          as="textarea"
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="ملاحظات اختيارية"
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">
              حركات كشف البنك (Statement Transactions)
            </h4>
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-primary hover:bg-primary/10"
            >
              <Plus size={14} />
              إضافة حركة
            </button>
          </div>
          <p className="mb-3 text-xs text-gray-500">
            Debit = حركة خارجة من البنك · Credit = حركة داخلة للبنك · لو أدخلت
            Amount فقط: الموجب = Credit والسالب = Debit
          </p>

          <div className="overflow-hidden rounded-xl">
            <Table
              columns={statementColumns}
              data={rows}
              onChange={handleRowChange}
              onDelete={handleDeleteRow}
              footer={statementFooter}
              emptyMessage="لا توجد حركات — أضف حركة جديدة"
            />
          </div>
        </div>

        {formError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError}
          </div>
        ) : null}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => navigate('/reconciliations')}
            className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {createMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء التسوية'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewReconciliationPage;
