import { axiosInstance } from '../../../app/api/axiosInstance';

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

const STATIC_BANKS = [
  {
    bankID: 1,
    bankCode: 'NCB',
    bankNameAr: 'البنك الأهلي السعودي',
    bankNameEn: 'National Commercial Bank',
    swiftCode: 'NCBKSAJE',
    phone: '+966-11-2525252',
    email: 'info@aljazirahcapital.com',
    website: 'https://www.aljazirahcapital.com',
    addressAr: 'شارع التحلية، العليا، الرياض',
    addressEn: 'Olaya Street, Al Olaya, Riyadh',
    isActive: true,
    accountID: 101,
    accountCount: 3,
  },
];

const STATIC_BANK_ACCOUNTS = [
  {
    bankAccountID: 1,
    bankID: 1,
    accountNumber: 'SA4420000001234567890123',
    accountNumberWithBranch: 'SA4420000001234567890123 - فرع العليا',
    accountNameAr: 'الحساب الرئيسي - ريال',
    accountNameEn: 'Main Account - SAR',
    currencyID: 1,
    currencyNameAr: 'ريال سعودي',
    currencyCode: 'SAR',
    currentBalance: 1250000.00,
    isActive: true,
    branchName: 'فرع العليا',
    iban: 'SA4420000001234567890123',
    minBalance: 10000,
    isDefault: true,
  },
  {
    bankAccountID: 2,
    bankID: 1,
    accountNumber: 'SA4420000009876543210987',
    accountNumberWithBranch: 'SA4420000009876543210987 - فرع الدمام',
    accountNameAr: 'حساب العملة الأجنبية',
    accountNameEn: 'Foreign Currency Account',
    currencyID: 2,
    currencyNameAr: 'دولار أمريكي',
    currencyCode: 'USD',
    currentBalance: 85000.50,
    isActive: true,
    branchName: 'فرع الدمام',
    iban: 'SA4420000009876543210987',
    minBalance: 5000,
    isDefault: false,
  },
  {
    bankAccountID: 3,
    bankID: 1,
    accountNumber: 'SA4420000005556667778889',
    accountNumberWithBranch: 'SA4420000005556667778889 - فرع جدة',
    accountNameAr: 'حساب الرواتب',
    accountNameEn: 'Payroll Account',
    currencyID: 1,
    currencyNameAr: 'ريال سعودي',
    currencyCode: 'SAR',
    currentBalance: 320000.00,
    isActive: false,
    branchName: 'فرع جدة',
    iban: 'SA4420000005556667778889',
    minBalance: 0,
    isDefault: false,
  },
];

export const getAllBanks = async (params) => {
  try {
    const { data } = await axiosInstance.get('/Banks', {
      params: {
        pageNumber: 1,
        pageSize: 20,
        ...params,
      },
    });
    const list = extractArray(data);
    return list.length > 0 ? list : STATIC_BANKS;
  } catch {
    return STATIC_BANKS;
  }
};

export const getBankById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/Banks/${id}`);
    return data;
  } catch {
    return STATIC_BANKS.find((b) => b.bankID === Number(id)) || null;
  }
};

export const createBank = async (payload) => {
  const { data } = await axiosInstance.post('/Banks', payload);
  return data;
};

export const updateBank = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/Banks/${id}`, payload);
  return data;
};

export const getBankAccounts = async (bankId, params = {}) => {
  try {
    const { data } = await axiosInstance.get('/BankAccounts', {
      params: {
        pageNumber: 1,
        pageSize: 20,
        bankId,
        ...params,
      },
    });
    const list = extractArray(data);
    return list.length > 0 ? list : STATIC_BANK_ACCOUNTS.filter((a) => a.bankID === Number(bankId));
  } catch {
    return STATIC_BANK_ACCOUNTS.filter((a) => a.bankID === Number(bankId));
  }
};

export const getBankAccountById = async (id) => {
  const { data } = await axiosInstance.get(`/BankAccounts/${id}`);
  return data;
};

export const deleteBank = async (id) => {
  const { data } = await axiosInstance.delete(`/Banks/${id}`);
  return data;
};

export const createBankAccount = async (payload) => {
  const { data } = await axiosInstance.post('/BankAccounts', payload);
  return data;
};

export const updateBankAccount = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/BankAccounts/${id}`, payload);
  return data;
};

export const deleteBankAccount = async (id) => {
  const { data } = await axiosInstance.delete(`/BankAccounts/${id}`);
  return data;
};

export const getAllBankAccounts = async (params = {}) => {
  const { data } = await axiosInstance.get('/BankAccounts', {
    params: { pageNumber: 1, pageSize: 100, ...params },
  });
  return data;
};
