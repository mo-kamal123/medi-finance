import { useState } from "react";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewJournalEntryPage = () => {
  const navigate = useNavigate();

  // Header Data
  const [journalEntryNumber, setJournalEntryNumber] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [journalType, setJournalType] = useState("1");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [financialPeriodID, setFinancialPeriodID] = useState(1);

  // Details Rows
  const [rows, setRows] = useState([
    { accountID: "", debitAmount: "", creditAmount: "", descriptionAr: "" },
    { accountID: "", debitAmount: "", creditAmount: "", descriptionAr: "" },
  ]);

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { accountID: "", debitAmount: "", creditAmount: "", descriptionAr: "" },
    ]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const totalDebit = rows.reduce(
    (sum, row) => sum + (parseFloat(row.debitAmount) || 0),
    0
  );

  const totalCredit = rows.reduce(
    (sum, row) => sum + (parseFloat(row.creditAmount) || 0),
    0
  );

  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isBalanced) {
      alert("يجب أن يكون مجموع المدين مساويًا للدائن");
      return;
    }

    const payload = {
      journalEntryNumber,
      entryDate,
      journalType,
      descriptionAr,
      referenceNumber,
      financialPeriodID,
      details: rows.map((row) => ({
        accountID: Number(row.accountID),
        debitAmount: Number(row.debitAmount) || 0,
        creditAmount: Number(row.creditAmount) || 0,
        descriptionAr: row.descriptionAr,
      })),
    };

    console.log("Sending Payload:", payload);

    await fetch("https://localhost:7081/api/journal-entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    navigate("/entries");
  };

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex items-center gap-3 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <ArrowLeft
          className="cursor-pointer text-gray-500 hover:text-gray-800"
          onClick={() => navigate(-1)}
        />
        <div>
          <h1 className="text-2xl font-bold">إنشاء قيد يومي</h1>
          <p className="text-gray-600 text-sm">
            يجب أن يكون مجموع المدين مساويًا للدائن
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6"
      >

        {/* Entry Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <input
            type="text"
            value={journalEntryNumber}
            onChange={(e) => setJournalEntryNumber(e.target.value)}
            placeholder="رقم القيد"
            className="border border-gray-200 rounded-lg px-4 py-2"
          />

          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            required
            className="border border-gray-200 rounded-lg px-4 py-2"
          />

          <select
            value={journalType}
            onChange={(e) => setJournalType(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2"
          >
            <option value="1">قيد يومية</option>
            <option value="2">قيد تسوية</option>
          </select>

          <input
            type="text"
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            placeholder="الوصف"
            className="border border-gray-200 rounded-lg px-4 py-2"
          />

          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="رقم المرجع"
            className="border border-gray-200 rounded-lg px-4 py-2"
          />

          <input
            type="number"
            value={financialPeriodID}
            onChange={(e) => setFinancialPeriodID(e.target.value)}
            placeholder="رقم الفترة المالية"
            className="border border-gray-200 rounded-lg px-4 py-2"
          />

        </div>

        {/* Details Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-primary/90 text-white">
              <tr>
                <th className="p-3 text-right">الحساب ID</th>
                <th className="p-3 text-right">الوصف</th>
                <th className="p-3 text-right">مدين</th>
                <th className="p-3 text-right">دائن</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border border-gray-200">

                  <td className="p-2">
                    <input
                      type="number"
                      value={row.accountID}
                      onChange={(e) =>
                        handleRowChange(index, "accountID", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2"
                      placeholder="Account ID"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="text"
                      value={row.descriptionAr}
                      onChange={(e) =>
                        handleRowChange(index, "descriptionAr", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      value={row.debitAmount}
                      onChange={(e) =>
                        handleRowChange(index, "debitAmount", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      value={row.creditAmount}
                      onChange={(e) =>
                        handleRowChange(index, "creditAmount", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    />
                  </td>

                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td colSpan="2" className="p-3 text-right">الإجمالي</td>
                <td className="p-3 text-green-600">
                  {totalDebit.toFixed(2)}
                </td>
                <td className="p-3 text-red-600">
                  {totalCredit.toFixed(2)}
                </td>
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
          {isBalanced ? "القيد متوازن ✅" : "القيد غير متوازن ❌"}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isBalanced}
            className="px-6 py-2 rounded-lg bg-primary text-white disabled:opacity-50"
          >
            حفظ القيد
          </button>
        </div>

      </form>
    </div>
  );
};

export default NewJournalEntryPage;
