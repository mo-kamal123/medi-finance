import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import FormInput from '../../../../shared/ui/input';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import DateInput from '../../../../shared/ui/date-input';
import { getErrorMessage } from '../../../../shared/lib/toast';
import { useBankAccounts } from '../../banks/hooks/banks.queries';
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

const ReconciliationCreateModal = ({ bankId, isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({
    bankAccountId: '',
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

  const { data: accountsRes = [] } = useBankAccounts(bankId);
  const { data: currencies = [] } = useCurrencies();
  const createMutation = useCreateBankReconciliation();

  const accounts = useMemo(
    () => (Array.isArray(accountsRes) ? accountsRes : []),
    [accountsRes]
  );

  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        value: String(account.bankAccountID ?? account.id),
        label:
          account.accountNumberWithBranch ||
          [account.accountNumber, account.accountNameAr].filter(Boolean).join(' - ') ||
          String(account.bankAccountID ?? account.id),
      })),
    [accounts]
  );

  const currencyOptions = useMemo(
    () =>
      (Array.isArray(currencies) ? currencies : []).map((c) => ({
        value: String(c.currencyID),
        label: c.currencyNameAr || c.currencyNameEn || c.currencyCode,
      })),
    [currencies]
  );

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRowChange = (index, key, value) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const handleAddRow = () => setRows((prev) => [...prev, { ...EMPTY_ROW }]);

  const handleRemoveRow = (index) =>
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

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
      bankStatementClosingBalance: toNumberOrUndefined(form.bankStatementClosingBalance),
      notes: form.notes || undefined,
      statementTransactions,
    };

    try {
      const created = await createMutation.mutateAsync(payload);
      const createdId =
        created?.id ?? created?.reconciliationId ?? created?.reconciliationID;
      onCreated?.(createdId ?? created);
      onClose();
      setForm({
        bankAccountId: '',
        currencyId: '',
        fromDate: '',
        toDate: '',
        statementDate: '',
        statementBalance: '',
        bankStatementClosingBalance: '',
        notes: '',
      });
      setRows([{ ...EMPTY_ROW }]);
    } catch (error) {
      setFormError(getErrorMessage(error, 'تعذر إنشاء التسوية'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">إنشاء تسوية بنك جديدة</h3>
            <p className="mt-1 text-sm text-gray-500">
              أدخل فترة التسوية ورصيد كشف البنك ثم أضف حركات الكشف المستوردة
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
          >
            إغلاق
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
            <div className="hidden md:block" />
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
              onChange={(e) => handleChange('bankStatementClosingBalance', e.target.value)}
              placeholder="0"
            />
            <div className="md:col-span-1" />
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
              Debit = حركة خارجة من البنك · Credit = حركة داخلة للبنك · لو أدخلت Amount فقط:
              الموجب = Credit والسالب = Debit
            </p>

            <div className="space-y-3">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-3 md:grid-cols-4"
                >
                  <DateInput
                    label="تاريخ الحركة"
                    value={row.transactionDate}
                    onChange={(e) => handleRowChange(index, 'transactionDate', e.target.value)}
                  />
                  <FormInput
                    label="Reference"
                    value={row.reference}
                    onChange={(e) => handleRowChange(index, 'reference', e.target.value)}
                    placeholder="مرجع"
                  />
                  <FormInput
                    label="External Reference"
                    value={row.externalReference}
                    onChange={(e) => handleRowChange(index, 'externalReference', e.target.value)}
                    placeholder="مرجع خارجي"
                  />
                  <FormInput
                    label="الوصف"
                    value={row.description}
                    onChange={(e) => handleRowChange(index, 'description', e.target.value)}
                    placeholder="وصف الحركة"
                  />
                  <FormInput
                    label="Debit (خارج)"
                    type="number"
                    value={row.debit}
                    onChange={(e) => handleRowChange(index, 'debit', e.target.value)}
                    placeholder="0"
                  />
                  <FormInput
                    label="Credit (داخل)"
                    type="number"
                    value={row.credit}
                    onChange={(e) => handleRowChange(index, 'credit', e.target.value)}
                    placeholder="0"
                  />
                  <FormInput
                    label="Amount"
                    type="number"
                    value={row.amount}
                    onChange={(e) => handleRowChange(index, 'amount', e.target.value)}
                    placeholder="موجب=داخل / سالب=خارج"
                  />
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <FormInput
                        label="Balance"
                        type="number"
                        value={row.balance}
                        onChange={(e) => handleRowChange(index, 'balance', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      disabled={rows.length === 1}
                      className="mb-0.5 rounded-lg p-2.5 text-red-500 hover:bg-red-50 disabled:opacity-30"
                      title="حذف الحركة"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
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
              onClick={onClose}
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
    </div>
  );
};

export default ReconciliationCreateModal;
