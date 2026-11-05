import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import DateInput from '../../../../shared/ui/date-input';
import FormInput from '../../../../shared/ui/input';
import { exportCustomerConsumption } from '../api/customers.api';
import { useCustomerPolicies } from '../hooks/customers.queries';

const CustomerConsumptionPanel = ({ customerId, isWithWataniya = true }) => {
  const {
    data: policies = [],
    isPending: isLoadingPolicies,
    isError: hasPolicyError,
    refetch,
  } = useCustomerPolicies(customerId, isWithWataniya);
  const [policyId, setPolicyId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [includeCanceledWithoutClaim, setIncludeCanceledWithoutClaim] = useState(false);
  const { mutate, isPending: isExporting, isError: hasExportError } = useMutation({
    mutationFn: async (params) => {
      const blob = await exportCustomerConsumption(params);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customer-${params.customerId}-consumption.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    },
  });

  const selectedPolicy = policies.find((policy) => String(policy.policyId) === policyId);
  const hasInvalidDateRange = Boolean(from && to && from > to);
  const canExport = selectedPolicy && from && to && !hasInvalidDateRange;

  const exportPolicy = (policy, fromDate, toDate) => {
    mutate({
      customerId: Number(policy.customerID ?? customerId),
      policyId: policy.policyId,
      from: fromDate,
      to: toDate,
      includeCanceledWithoutClaim,
    });
  };

  const selectPolicy = (event) => {
    const value = event.target.value;
    const policy = policies.find((item) => String(item.policyId) === value);
    setPolicyId(value);
    const fromDate = policy?.startDate?.slice(0, 10) ?? '';
    const toDate = policy?.endDate?.slice(0, 10) ?? '';
    setFrom(fromDate);
    setTo(toDate);
  };

  const handleExport = (event) => {
    event.preventDefault();
    if (!canExport || isExporting) return;

    exportPolicy(selectedPolicy, from, to);
  };

  if (isLoadingPolicies) return <p role="status">جاري تحميل الوثائق...</p>;
  if (hasPolicyError) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p role="alert" className="text-red-600">تعذر تحميل الوثائق</p>
        <button type="button" onClick={() => refetch()} className="font-medium text-primary">
          إعادة المحاولة
        </button>
      </div>
    );
  }
  if (policies.length === 0) return <p className="text-gray-500">لا توجد وثائق متاحة</p>;

  return (
    <form onSubmit={handleExport} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput
          id="consumption-policy"
          as="select"
          label="Policy"
          placeholder="Select a policy"
          value={policyId}
          onChange={selectPolicy}
          disabled={isExporting}
          containerClass="md:col-span-2"
          required
        >
          {policies.map((policy) => (
            <option key={policy.policyId} value={policy.policyId}>{policy.displayName}</option>
          ))}
        </FormInput>
        <DateInput
          id="consumption-from"
          label="من تاريخ"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          required
        />
        <DateInput
          id="consumption-to"
          label="إلى تاريخ"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          error={hasInvalidDateRange ? 'تاريخ النهاية يجب ألا يسبق تاريخ البداية' : undefined}
          required
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={includeCanceledWithoutClaim}
          onChange={(event) => setIncludeCanceledWithoutClaim(event.target.checked)}
        />
        تضمين الحالات الملغاة بدون مطالبة
      </label>
      <button
        type="submit"
        disabled={!canExport || isExporting}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        <Download size={16} />
        {isExporting ? 'جاري تحميل الملف...' : 'تحميل ملف Excel'}
      </button>
      {hasExportError && <p role="alert" className="text-red-600">تعذر تحميل ملف الاستهلاكات</p>}
    </form>
  );
};

export default CustomerConsumptionPanel;
