import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Table from "../../../shared/ui/table";

const dailyEntriesData = [
  { id: 1, date: "2026-02-10", description: "مبيعات نقدية", type: "income", amount: 1500 },
  { id: 2, date: "2026-02-10", description: "شراء مستلزمات", type: "expense", amount: 500 },
];

const DailyEntriesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const navigate = useNavigate();

  const filteredEntries = useMemo(() => {
    return dailyEntriesData.filter((entry) => {
      const matchesSearch = entry.description.includes(searchQuery);
      const matchesType = typeFilter === "all" || entry.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, typeFilter]);

  const onAddEntry = () => {
    navigate("/entries/new");
  };

  // ✅ تعريف الأعمدة
  const columns = [
    {
      header: "التاريخ",
      key: "date",
    },
    {
      header: "الوصف",
      key: "description",
    },
    {
      header: "النوع",
      key: "type",
      type: "custom",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.type === "income"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {row.type === "income" ? "إيراد" : "مصروف"}
        </span>
      ),
    },
    {
      header: "المبلغ",
      key: "amount",
      type: "custom",
      render: (row) => (
        <span className="font-medium">{row.amount} ر.س</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">القيود اليومية</h1>
          <p className="text-gray-600 text-sm">
            إدارة جميع المصروفات والإيرادات اليومية بسهولة.
          </p>
        </div>

        <button
          onClick={onAddEntry}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={16} />
          إضافة إدخال جديد
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="بحث..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="all">الكل</option>
          <option value="income">إيرادات</option>
          <option value="expense">مصروفات</option>
        </select>
      </div>

      {/* ✅ Reusable Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          columns={columns}
          data={filteredEntries}
        />
      </div>
    </div>
  );
};

export default DailyEntriesPage;
