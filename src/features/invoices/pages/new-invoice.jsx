import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewInvoice = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    invoiceTypeID: "",
    customerID: "",
    supplierID: "",
    taxAmount: 0,
    discountAmount: 0,
    financialPeriodID: "",
    status: "pending",
    createdBy: "admin",
    details: [
      {
        productServiceID: "",
        quantity: 1,
        unitPrice: 0,
        discountPercentage: 0,
        taxPercentage: 0,
      },
    ],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (index, field, value) => {
    const updated = [...formData.details];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, details: updated }));
  };

  const addDetailRow = () => {
    setFormData((prev) => ({
      ...prev,
      details: [
        ...prev.details,
        {
          productServiceID: "",
          quantity: 1,
          unitPrice: 0,
          discountPercentage: 0,
          taxPercentage: 0,
        },
      ],
    }));
  };

  const removeDetailRow = (index) => {
    const updated = formData.details.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, details: updated }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      invoiceDate: new Date(formData.invoiceDate).toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
      invoiceTypeID: Number(formData.invoiceTypeID),
      customerID: Number(formData.customerID),
      supplierID: Number(formData.supplierID),
      financialPeriodID: Number(formData.financialPeriodID),
      taxAmount: Number(formData.taxAmount),
      discountAmount: Number(formData.discountAmount),
      details: formData.details.map((item) => ({
        productServiceID: Number(item.productServiceID),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discountPercentage: Number(item.discountPercentage),
        taxPercentage: Number(item.taxPercentage),
      })),
    };

    console.log("Payload to API:", payload);
    // await axios.post("/api/invoices", payload);
  };

  return (
    <div className="space-y-8 p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <ArrowLeft
          className="cursor-pointer text-gray-500 hover:text-gray-800 transition"
          onClick={() => navigate(-1)}
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            إنشاء فاتورة جديدة
          </h1>
          <p className="text-gray-500 mt-1">
            قم بإدخال بيانات الفاتورة الجديدة وحفظها بسهولة
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 space-y-8"
      >
        {/* Main Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NormalInput
            label="رقم الفاتورة"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleChange}
          />

          <NormalSelect
            label="نوع الفاتورة"
            name="invoiceTypeID"
            value={formData.invoiceTypeID}
            onChange={handleChange}
            options={[
              { value: "", label: "اختر" },
              { value: "1", label: "فاتورة بيع" },
              { value: "2", label: "فاتورة شراء" },
            ]}
          />

          <NormalInput
            label="تاريخ الإصدار"
            name="invoiceDate"
            type="date"
            value={formData.invoiceDate}
            onChange={handleChange}
          />

          <NormalInput
            label="تاريخ الاستحقاق"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
          />

          <NormalInput
            label="معرف العميل"
            name="customerID"
            type="number"
            value={formData.customerID}
            onChange={handleChange}
          />

          <NormalInput
            label="معرف المورد"
            name="supplierID"
            type="number"
            value={formData.supplierID}
            onChange={handleChange}
          />
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              تفاصيل الخدمات
            </h2>
            <button
              type="button"
              onClick={addDetailRow}
              className="flex items-center gap-2 text-white bg-primary hover:bg-primary/90 px-3 py-1 rounded-lg transition"
            >
              <Plus size={16} />
              إضافة خدمه
            </button>
          </div>

          {formData.details.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end border border-gray-300 rounded-xl p-4 bg-gray-50"
            >
              <input
                type="text"
                placeholder="Product ID"
                value={item.productServiceID}
                onChange={(e) =>
                  handleDetailChange(index, "productServiceID", e.target.value)
                }
                className="input-modern"
              />
              <input
                type="number"
                placeholder="الكمية"
                value={item.quantity}
                onChange={(e) => handleDetailChange(index, "quantity", e.target.value)}
                className="input-modern"
              />
              <input
                type="number"
                placeholder="سعر الوحدة"
                value={item.unitPrice}
                onChange={(e) => handleDetailChange(index, "unitPrice", e.target.value)}
                className="input-modern"
              />
              <input
                type="number"
                placeholder="خصم %"
                value={item.discountPercentage}
                onChange={(e) =>
                  handleDetailChange(index, "discountPercentage", e.target.value)
                }
                className="input-modern"
              />
              <input
                type="number"
                placeholder="ضريبة %"
                value={item.taxPercentage}
                onChange={(e) => handleDetailChange(index, "taxPercentage", e.target.value)}
                className="input-modern"
              />
              <button
                type="button"
                onClick={() => removeDetailRow(index)}
                className="text-red-500 hover:text-red-700 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-8 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition"
          >
            حفظ الفاتورة
          </button>
        </div>
      </form>
    </div>
  );
};

// Normal input with label above
const NormalInput = ({ label, name, value, onChange, type = "text" }) => (
  <div className="w-full flex flex-col mb-4">
    <label htmlFor={name} className="mb-1 text-gray-700 font-medium">
      {label}
    </label>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
      required
    />
  </div>
);

// Normal select with label above
const NormalSelect = ({ label, name, value, onChange, options }) => (
  <div className="w-full flex flex-col mb-4">
    <label htmlFor={name} className="mb-1 text-gray-700 font-medium">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
      required
    >
      {options.map((opt, i) => (
        <option key={i} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);


export default NewInvoice;
