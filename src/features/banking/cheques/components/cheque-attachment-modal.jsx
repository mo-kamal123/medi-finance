import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ExternalLink,
  FileText,
  LoaderCircle,
  Paperclip,
  Upload,
  X,
} from 'lucide-react';
import { getErrorMessage } from '../../../../shared/lib/toast';
import { useUploadChequeAttachment } from '../hooks/cheques.mutations';

const formatFileSize = (size) => {
  const bytes = Number(size);
  if (size == null || !Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getAttachmentUrl = (url) => {
  if (typeof url !== 'string' || !url.trim()) return null;
  try {
    const apiBase = new URL(
      import.meta.env.VITE_API_URL || window.location.origin,
      window.location.origin
    );
    const resolved = new URL(url, apiBase);
    return ['http:', 'https:'].includes(resolved.protocol)
      ? resolved.href
      : null;
  } catch {
    return null;
  }
};

const ChequeAttachmentModal = ({
  chequeId,
  chequeNumber,
  attachment = null,
  onClose,
}) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const fileInput = useRef(null);
  const upload = useUploadChequeAttachment();
  const existingAttachments =
    attachment && typeof attachment === 'object' && !Array.isArray(attachment)
      ? [attachment]
      : [];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    if (!file || file.size === 0) {
      setError(
        file ? 'الملف المحدد فارغ. اختر ملفًا آخر.' : 'اختر ملفًا لرفعه'
      );
      return;
    }
    submitting.current = true;
    setError('');
    try {
      await upload.mutateAsync({ id: chequeId, file });
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
    } catch (error) {
      setError(getErrorMessage(error, 'تعذر رفع المرفق. حاول مرة أخرى.'));
    } finally {
      submitting.current = false;
    }
  };

  return createPortal(
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cheque-attachment-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2
              id="cheque-attachment-title"
              className="flex items-center gap-2 text-lg font-bold text-gray-900"
            >
              <Paperclip size={20} className="text-primary" />
              مرفقات الشيك
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {chequeNumber || `شيك ${chequeId}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={upload.isPending}
            aria-label="إغلاق"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>
        <section
          aria-labelledby="cheque-existing-attachments"
          className="mb-6 space-y-3"
        >
          <h3
            id="cheque-existing-attachments"
            className="text-sm font-semibold text-gray-700"
          >
            المرفقات الحالية ({existingAttachments.length})
          </h3>
          {existingAttachments.length > 0 ? (
            <ul className="space-y-2">
              {existingAttachments.map((attachment, index) => {
                const url = getAttachmentUrl(attachment.url);
                const name = attachment.name || `مرفق ${index + 1}`;
                return (
                  <li
                    key={`${attachment.url ?? name}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3"
                  >
                    <FileText size={24} className="shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="break-all text-sm font-medium text-gray-900">
                        {name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500" dir="ltr">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`عرض ${name}`}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
                      >
                        <ExternalLink size={16} />
                        عرض
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">
                        الرابط غير متاح
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
              لا توجد مرفقات لهذا الشيك.
            </p>
          )}
        </section>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5">
            <label
              htmlFor="cheque-attachment-file"
              className="mb-3 flex items-center gap-2 font-medium text-gray-700"
            >
              <Upload size={18} className="text-primary" />
              اختر المرفق
            </label>
            <input
              ref={fileInput}
              id="cheque-attachment-file"
              type="file"
              disabled={upload.isPending}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setError('');
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'cheque-attachment-error' : undefined}
              className="block w-full text-sm text-gray-600 file:me-3 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-medium file:text-primary disabled:opacity-50"
            />
          </div>
          {file && (
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
              <FileText size={24} className="shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="break-all text-sm font-medium text-gray-900">
                  {file.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          )}
          {error && (
            <p
              id="cheque-attachment-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={upload.isPending}
              className="rounded-lg border border-gray-200 px-5 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={upload.isPending || !file}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 font-medium text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {upload.isPending ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {upload.isPending ? 'جاري رفع المرفق...' : 'رفع المرفق'}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
};

export default ChequeAttachmentModal;
