import { useState } from "react";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

const accountsList = [
  "الصندوق",
  "البنك",
  "المبيعات",
  "المشتريات",
  "المصاريف",
  "العملاء",
  "الموردين",
];

const NewJournalEntryPage = () => {
  const [entryNumber, setEntryNumber] = useState("JE-001");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [rows, setRows] = useState([
    { account: "", debit: "", credit: "" },
    { account: "", debit: "", credit: "" },
  ]);

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { account: "", debit: "", credit: "" }]);
  };

  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  const totalDebit = rows.reduce(
    (sum, row) => sum + (parseFloat(row.debit) || 0),
    0
  );

  const totalCredit = rows.reduce(
    (sum, row) => sum + (parseFloat(row.credit) || 0),
    0
  );

  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isBalanced) {
      alert("يجب أن يكون مجموع المدين مساوٍ للدائن");
      return;
    }

    const journalEntry = {
      entryNumber,
      date,
      description,
      rows,
      totalDebit,
      totalCredit,
    };

    console.log("Journal Entry:", journalEntry);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <ArrowLeft className="cursor-pointer text-gray-500 hover:text-gray-800" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            إنشاء قيد يومي
          </h1>
          <p className="text-gray-600 text-sm">
            يجب أن يكون مجموع المدين مساويًا للدائن
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6"
      >
        {/* Entry Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input
            type="text"
            value={entryNumber}
            onChange={(e) => setEntryNumber(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
            placeholder="رقم القيد"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
            required
          />

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف العملية"
            className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-primary/90 text-white">
              <tr>
                <th className="p-3 text-right">الحساب</th>
                <th className="p-3 text-right">مدين</th>
                <th className="p-3 text-right">دائن</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-gray-300">
                  <td className="p-2">
                    <select
                      value={row.account}
                      onChange={(e) =>
                        handleRowChange(index, "account", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">اختر حساب</option>
                      {accountsList.map((acc) => (
                        <option key={acc} value={acc}>
                          {acc}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      value={row.debit}
                      onChange={(e) =>
                        handleRowChange(index, "debit", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      value={row.credit}
                      onChange={(e) =>
                        handleRowChange(index, "credit", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>

                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Totals */}
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td className="p-3 text-right">الإجمالي</td>
                <td className="p-3">{totalDebit.toFixed(2)}</td>
                <td className="p-3">{totalCredit.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Add Row */}
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 text-primary font-medium"
        >
          <Plus size={16} />
          إضافة سطر
        </button>

        {/* Balance Status */}
        <div
          className={`p-3 rounded-lg text-sm ${
            isBalanced
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isBalanced
            ? "القيد متوازن ✅"
            : "القيد غير متوازن ❌"}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isBalanced}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50"
          >
            حفظ القيد
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewJournalEntryPage;
