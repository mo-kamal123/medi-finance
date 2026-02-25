import { Eye, Edit, Trash } from 'lucide-react';

const InvoiceRow = ({ invoice }) => {
  const handleView = () => console.log('View', invoice.id);
  const handleEdit = () => console.log('Edit', invoice.id);
  const handleDelete = () => console.log('Delete', invoice.id);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-700">{invoice.number}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{invoice.client}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{invoice.date}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{invoice.amount}</td>
      <td className="px-4 py-3 text-sm">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            invoice.status === 'مدفوعة'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {invoice.status}
        </span>
      </td>
      <td className="px-4 py-3 flex gap-2">
        <button onClick={handleView} className="p-1 rounded hover:bg-gray-100">
          <Eye size={16} />
        </button>
        <button onClick={handleEdit} className="p-1 rounded hover:bg-gray-100">
          <Edit size={16} />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 rounded hover:bg-red-50 text-red-600"
        >
          <Trash size={16} />
        </button>
      </td>
    </tr>
  );
};

export default InvoiceRow;
