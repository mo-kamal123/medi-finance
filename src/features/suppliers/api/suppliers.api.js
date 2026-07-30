import { axiosInstance } from '../../../app/api/axiosInstance';

export const getSuppliers = async (params = {}) => {
  const { data } = await axiosInstance.get('/suppliers', { params });
  return {
    items: Array.isArray(data?.data) ? data.data : [],
    totalCount: data.totalCount ?? 0,
    totalPages: data.totalPages ?? 1,
    pageNumber: data.pageNumber ?? 1,
    pageSize: data.pageSize ?? 20,
  };
};

export const getSupplier = async (id) => {
  const MOCK_DATA = {
    basicInfo: {
      providerNameAr: "العزبي",
      providerNameEn: "Al Ezaby Pharmacy",
      className: "A",
      statusName: "Activated",
      categoryName: "Pharmacy",
      generalSpecialist: "",
      subSpecialist: "",
      batchDueDays: "15",
      hotLine: "19600",
      importanceLevel: "A",
      reviewStatus: "Fully Reviewed",
      headQuartersGovernorate: "محافظة القاهرة",
      localDiscount: "4",
      importedDiscount: "0",
      headQuartersAddress: "",
      allowChronicOnPortal: "",
      providerWorkWithMedicard: "",
      medicardContractAvailable: "",
      medicardProvider: "",
      providerLogo: "",
      notes: ""
    },
    locations: [
      {
        name: "",
        government: "محافظة أسيوط",
        city: "ديروط",
        areaAr: "ديروط",
        addressAr: "مركز ديروط -ميدان المحطة – محافظة اسيوط",
        telephone1: "19600",
        mobile1: "01063517813",
        mobile2: "",
        latitude: "27.5618516",
        longitude: "30.8131175",
        googleMapsUrl: "",
        kilo: "",
        status: "Activated",
        deleted: "No"
      },
      {
        name: "فرع المعادي",
        government: "محافظة القاهرة",
        city: "المعادي",
        areaAr: "المعادي الجديدة",
        addressAr: "شارع 9 المعادي - القاهرة",
        telephone1: "0225190000",
        mobile1: "01012345678",
        mobile2: "01098765432",
        latitude: "29.9104",
        longitude: "31.2357",
        googleMapsUrl: "https://maps.google.com/?q=29.9104,31.2357",
        kilo: "5",
        status: "Activated",
        deleted: "No"
      }
    ],
    contacts: [
      {
        name: "ا/ علاء",
        jobTitle: "مدير تعاقدات",
        email: "contactus@elezabypharmacy.com",
        mobile: "01114468265",
        notes: ""
      },
      {
        name: "ا/ سمير",
        jobTitle: "مدير المبيعات",
        email: "samir@elezabypharmacy.com",
        mobile: "01225558899",
        notes: "لتواصل في أيام العمل"
      }
    ],
    financeInfo: {
      commercialRegistrationNumber: "204112",
      vatNumber: "716-505-185",
      adminFees: "0",
      taxes: "1",
      taxAdvanceDocumentDate: "2025-01-15"
    },
    allowedPrograms: [
      {
        name: "Bronze-A | Middle East Glass Manufacturing Co.",
        program: "2"
      },
      {
        name: "Silver-B | Cairo Pharmaceuticals",
        program: "3"
      }
    ],
    attachments: [
      {
        fileName: "عقد العزبى الجديد.pdf",
        fileSize: "1.9 MB",
        uploadDate: "2026-06-14 13:57"
      },
      {
        fileName: "رخصة التجارة.pdf",
        fileSize: "500 KB",
        uploadDate: "2026-05-10 09:30"
      }
    ]
  };

  return MOCK_DATA;
};

export const getSupplierStatuses = async () => {
  const { data } = await axiosInstance.get('/lookups/supplier-statuses');
  return Array.isArray(data) ? data : [];
};

export const getProviderClasses = async () => {
  const { data } = await axiosInstance.get('/lookups/provider-classes');
  return Array.isArray(data) ? data : [];
};

export const getImportanceLevels = async () => {
  const { data } = await axiosInstance.get('/lookups/importance-levels');
  return Array.isArray(data) ? data : [];
};

export const getGovernorates = async () => {
  const { data } = await axiosInstance.get('/lookups/governorates');
  return Array.isArray(data) ? data : [];
};
