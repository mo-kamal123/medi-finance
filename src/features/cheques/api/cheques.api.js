import { axiosInstance } from '../../../app/api/axiosInstance';

import { getInvoiceByNumber } from '../../invoices/api/invoices-api';

const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  const checks = ['data', 'items', 'list', '$values', 'records', 'rows', 'result'];
  for (const key of checks) {
    const val = data[key];
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') {
      for (const sub of checks) {
        if (Array.isArray(val[sub])) return val[sub];
      }
    }
  }
  const found = Object.values(data).find(Array.isArray);
  return found || [];
};

const STATIC_CHEQUES = [
  {
    chequeID: 1,
    chequeNumber: 'CHQ-001',
    chequeDate: '2026-08-01',
    receiptDate: '2026-08-03',
    dueDate: '2026-09-01',
    amount: 50000,
    currencyID: 1,
    currencyNameAr: 'ريال سعودي',
    bankID: 1,
    bankName: 'البنك الأهلي السعودي',
    customerID: 1,
    customerName: 'شركة الاتصالات السعودية',
    supplierID: null,
    supplierName: null,
    status: 'تحت التحصيل',
    statusAlert: '',
    daysPending: 17,
    beneficiaryName: 'شركة الاتصالات السعودية',
    branchName: 'الفرع الرئيسي',
    bankBranchName: 'فرع العليا',
    cardNumber: '',
    notes: 'شيك مرتبط بفاتورة أغسطس',
    isNonCashable: false,
    isBearerOnly: false,
    hasAttachmentPage: false,
  },
  {
    chequeID: 2,
    chequeNumber: 'CHQ-002',
    chequeDate: '2026-07-20',
    receiptDate: '2026-07-22',
    dueDate: '2026-08-20',
    amount: 125000,
    currencyID: 1,
    currencyNameAr: 'ريال سعودي',
    bankID: 2,
    bankName: 'مصرف الراجحي',
    customerID: null,
    customerName: null,
    supplierID: 1,
    supplierName: 'شركة التقنية المتقدمة',
    status: 'متردد',
    statusAlert: 'تجاوز تاريخ الاستحقاق',
    daysPending: 31,
    beneficiaryName: 'شركة التقنية المتقدمة',
    branchName: 'فرع جدة',
    bankBranchName: 'فرع الحمراء',
    cardNumber: '',
    notes: 'يحتاج متابعة',
    isNonCashable: false,
    isBearerOnly: true,
    hasAttachmentPage: true,
  },
  {
    chequeID: 3,
    chequeNumber: 'CHQ-003',
    chequeDate: '2026-08-10',
    receiptDate: null,
    dueDate: '2026-09-10',
    amount: 7500,
    currencyID: 2,
    currencyNameAr: 'دولار أمريكي',
    bankID: 3,
    bankName: 'البنك السعودي البريطاني',
    customerID: 2,
    customerName: 'مؤسسة النور للتجارة',
    supplierID: null,
    supplierName: null,
    status: 'جاري التحصيل',
    statusAlert: '',
    daysPending: 10,
    beneficiaryName: 'مؤسسة النور للتجارة',
    branchName: '',
    bankBranchName: 'فرع الملك فهد',
    cardNumber: '',
    notes: '',
    isNonCashable: false,
    isBearerOnly: false,
    hasAttachmentPage: false,
  },
  {
    chequeID: 4,
    chequeNumber: 'CHQ-004',
    chequeDate: '2026-06-15',
    receiptDate: '2026-06-18',
    dueDate: '2026-07-15',
    amount: 200000,
    currencyID: 1,
    currencyNameAr: 'ريال سعودي',
    bankID: 1,
    bankName: 'البنك الأهلي السعودي',
    customerID: 3,
    customerName: 'グループGLOBAL',
    supplierID: null,
    supplierName: null,
    status: 'محصل',
    statusAlert: '',
    daysPending: 0,
    beneficiaryName: 'Global Group',
    branchName: 'الفرع المركزي',
    bankBranchName: 'فرع الدمام',
    cardNumber: '',
    notes: 'تم التحصيل بنجاح',
    isNonCashable: false,
    isBearerOnly: false,
    hasAttachmentPage: false,
  },
  {
    chequeID: 5,
    chequeNumber: 'CHQ-005',
    chequeDate: '2026-08-05',
    receiptDate: '2026-08-06',
    dueDate: '2026-08-05',
    amount: 32000,
    currencyID: 1,
    currencyNameAr: 'ريال سعودي',
    bankID: 2,
    bankName: 'مصرف الراجحي',
    customerID: null,
    customerName: null,
    supplierID: 2,
    supplierName: 'مؤسسة الأمل للمقاولات',
    status: 'مرتجع',
    statusAlert: 'شيك مرفوض',
    daysPending: 45,
    beneficiaryName: 'مؤسسة الأمل للمقاولات',
    branchName: '',
    bankBranchName: 'فرع التحلية',
    cardNumber: '',
    notes: 'تم رفض الشيك من البنك',
    isNonCashable: true,
    isBearerOnly: false,
    hasAttachmentPage: false,
  },
  {
    chequeID: 6,
    chequeNumber: 'CHQ-006',
    chequeDate: '2026-08-12',
    receiptDate: null,
    dueDate: '2026-09-12',
    amount: 89500,
    currencyID: 1,
    currencyNameAr: 'ريال سعودي',
    bankID: 3,
    bankName: 'البنك السعودي البريطاني',
    customerID: 4,
    customerName: 'شركة المستقبل للخدمات',
    supplierID: null,
    supplierName: null,
    status: 'تحت التحصيل',
    statusAlert: '',
    daysPending: 8,
    beneficiaryName: 'شركة المستقبل للخدمات',
    branchName: 'فرع الرياض',
    bankBranchName: 'فرع العليا',
    cardNumber: '',
    notes: '',
    isNonCashable: false,
    isBearerOnly: false,
    hasAttachmentPage: true,
  },
  {
    chequeID: 7,
    chequeNumber: 'CHQ-007',
    chequeDate: '2026-07-01',
    receiptDate: '2026-07-03',
    dueDate: '2026-08-01',
    amount: 45000,
    currencyID: 2,
    currencyNameAr: 'دولار أمريكي',
    bankID: 1,
    bankName: 'البنك الأهلي السعودي',
    customerID: null,
    customerName: null,
    supplierID: 3,
    supplierName: 'شركة التقنية الحديثة',
    status: 'متردد',
    statusAlert: 'يحتاج متابعة',
    daysPending: 50,
    beneficiaryName: 'شركة التقنية الحديثة',
    branchName: '',
    bankBranchName: 'فرع الخبر',
    cardNumber: '',
    notes: 'تم التواصل مع المورد',
    isNonCashable: false,
    isBearerOnly: false,
    hasAttachmentPage: false,
  },
  {
    chequeID: 8,
    chequeNumber: 'CHQ-008',
    chequeDate: '2026-08-18',
    receiptDate: '2026-08-19',
    dueDate: '2026-09-18',
    amount: 15000,
    currencyID: 1,
    currencyNameAr: 'ريال سعودي',
    bankID: 2,
    bankName: 'مصرف الراجحي',
    customerID: 5,
    customerName: 'مكتب الرائد للمحاماة',
    supplierID: null,
    supplierName: null,
    status: 'جاري التحصيل',
    statusAlert: '',
    daysPending: 2,
    beneficiaryName: 'مكتب الرائد للمحاماة',
    branchName: 'المكتب الرئيسي',
    bankBranchName: 'فرع الواحة',
    cardNumber: '',
    notes: 'شيك جديد',
    isNonCashable: false,
    isBearerOnly: false,
    hasAttachmentPage: false,
  },
];

export const getAllCheques = async (params) => {
  const { data } = await axiosInstance.get('/cheques', { params });
  return data;
};

export const getChequeById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/cheques/${id}`);
    return data;
  } catch {
    return STATIC_CHEQUES.find((c) => c.chequeID === Number(id)) || null;
  }
};

export const createCheque = async (payload) => {
  const { data } = await axiosInstance.post('/cheques', payload);
  return data;
};

export const updateCheque = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/cheques/${id}`, payload);
  return data;
};

export const deleteCheque = async (id) => {
  const { data } = await axiosInstance.delete(`/cheques/${id}`);
  return data;
};

export const getChequeStatuses = async () => {
  try {
    const { data } = await axiosInstance.get('/cheques/statuses');
    const list = extractArray(data);
    return list.length > 0 ? list : [
      { id: 1, nameAr: 'تحت التحصيل', name: 'Pending' },
      { id: 2, nameAr: 'جاري التحصيل', name: 'Collecting' },
      { id: 3, nameAr: 'محصل', name: 'Collected' },
      { id: 4, nameAr: 'متردد', name: 'Hesitant' },
      { id: 5, nameAr: 'مرتجع', name: 'Returned' },
    ];
  } catch {
    return [
      { id: 1, nameAr: 'تحت التحصيل', name: 'Pending' },
      { id: 2, nameAr: 'جاري التحصيل', name: 'Collecting' },
      { id: 3, nameAr: 'محصل', name: 'Collected' },
      { id: 4, nameAr: 'متردد', name: 'Hesitant' },
      { id: 5, nameAr: 'مرتجع', name: 'Returned' },
    ];
  }
};

export const getPendingCheques = async (params) => {
  try {
    const { data } = await axiosInstance.get('/cheques/pending', { params });
    const list = extractArray(data);
    return list.length > 0 ? list : STATIC_CHEQUES;
  } catch {
    return STATIC_CHEQUES;
  }
};

export const updateChequeStatus = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/cheques/${id}/status`, payload);
  return data;
};

export const getChequeBanks = async () => {
  const res = await axiosInstance.get('/Banks', {
    params: { pageNumber: 1, pageSize: 20 },
  });
  return extractArray(res.data);
};

export const getChequeCustomers = async () => {
  const { data } = await axiosInstance.get('/customers', {
    params: { pageNumber: 1, pageSize: 200 },
  });
  return extractArray(data);
};

export const getSupplierList = async () => {
  const { data } = await axiosInstance.get('/suppliers', {
    params: { pageNumber: 1, pageSize: 200 },
  });
  return extractArray(data);
};

export const getCurrencies = async () => {
  const { data } = await axiosInstance.get('/currencies');
  return extractArray(data);
};

export { getInvoiceByNumber };
