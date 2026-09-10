import { useState } from 'react';
import { getBankTransfersReportExportExcel } from '../api/bank-transfers.api';
import { toast } from '../../../../../shared/lib/toast';

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const useBankTransfersReportExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (filters = {}) => {
    setIsExporting(true);
    try {
      const blob = await getBankTransfersReportExportExcel(filters);
      downloadBlob(blob, 'bank-transfers.xlsx');
      toast.success('تم تصدير التقرير بنجاح');
    } catch {
      toast.error('تعذر تصدير التقرير');
    } finally {
      setIsExporting(false);
    }
  };

  return { handleExport, isExporting };
};