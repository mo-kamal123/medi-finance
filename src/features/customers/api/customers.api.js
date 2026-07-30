import { axiosInstance } from '../../../app/api/axiosInstance';

export const getCustomers = async (params = {}) => {
  const { data } = await axiosInstance.get('/customers', { params });
  return {
    items: Array.isArray(data?.data) ? data.data : [],
    totalCount: data.totalCount ?? 0,
    totalPages: data.totalPages ?? 1,
    pageNumber: data.pageNumber ?? 1,
    pageSize: data.pageSize ?? 20,
  };
};

export const getCustomerById = async (id) => {
  const MOCK_DATA = {
    clientName: "Mediconsult",
    reimbursementDueDays: 14,
    clientCategory: "Hospitality",
    status: "Activated",
    clientType: "شركة ذات مسؤولية محدودة",
    contacts: [
      {
        name: "المركز",
        jobTitle: "بالمركز",
        email: "aaa@gmail.com",
        mobile: "01005515067",
        address: "القاهرة - مصر الجديدة",
        notes: "مفضل التواصل صباحاً"
      },
      {
        name: "أحمد علي",
        jobTitle: "مدير مالي",
        email: "ahmed@mediconsult.com",
        mobile: "01234567890",
        address: "",
        notes: ""
      }
    ],
    branches: [
      {
        branchName: "Mediconsult",
        branchStatus: "Activated"
      },
      {
        branchName: "Mediconsult - فرع الإسكندرية",
        branchStatus: "Activated"
      },
      {
        branchName: "Mediconsult - فرع القاهرة الجديدة",
        branchStatus: "Inactive"
      }
    ]
  };

  return MOCK_DATA;
};
