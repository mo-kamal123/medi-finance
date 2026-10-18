import { Download, FileText, Paperclip } from 'lucide-react';
import { formatFileSize } from '../../../../shared/utils/formatters';

const BatchAttachmentsTab = ({ attachments = [] }) => {
  if (attachments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 px-6 py-14 text-center">
        <Paperclip size={28} className="text-gray-400" aria-hidden="true" />
        <h2 className="text-base font-semibold text-gray-900">لا توجد مرفقات</h2>
        <p className="text-sm text-gray-500">لم يتم إضافة مرفقات لهذه الدفعة بعد.</p>
      </div>
    );
  }

  return (
    <section aria-label="مرفقات الدفعة" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {attachments.map((file, index) => {
        const name = file.fileName ?? file.name ?? 'مرفق';
        const size = file.fileSize ?? file.size;
        const url = file.downloadUrl ?? file.filePath ?? file.url;
        return (
          <article key={file.attachmentID ?? file.id ?? index} className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5">
            <div dir="ltr" className="flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText size={22} aria-hidden="true" />
              </span>
              <div className="min-w-0 text-left">
                <h3 className="wrap-break-word text-sm font-semibold text-gray-900" title={name}>{name}</h3>
                <p className="mt-1 text-xs text-gray-500" dir="ltr">{size != null ? formatFileSize(size) : '-'}</p>
              </div>
            </div>
            {url ? (
              <a href={url} download={name} target="_blank" rel="noreferrer" aria-label={`تحميل ${name}`} className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90">
                <Download size={16} aria-hidden="true" />
                تحميل
              </a>
            ) : (
              <button type="button" disabled className="mt-auto rounded-lg bg-gray-100 px-4 py-2.5 text-sm text-gray-400">التحميل غير متاح</button>
            )}
          </article>
        );
      })}
    </section>
  );
};

export default BatchAttachmentsTab;
