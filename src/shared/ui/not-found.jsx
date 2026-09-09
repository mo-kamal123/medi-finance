import { ArrowRight, FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/cn';

const NotFound = ({
  label = 'عذراً، لم يتم العثور على البيانات',
  description = '',
  onBack,
  backLabel = 'رجوع',
  className = '',
}) => {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <div
      className={cn(
        'flex min-h-[70vh] w-full items-center justify-center px-6 py-12 text-center',
        className
      )}
      dir="rtl"
    >
      <div className="flex w-full max-w-md flex-col items-center">
        {/* Icon */}
        <div className="relative mb-7">
          <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-xl" />

          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-primary">
              <FileQuestion size={25} strokeWidth={1.8} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            {label}
          </h2>

          {description && (
            <p className="mx-auto max-w-sm text-sm leading-6 text-gray-500">
              {description}
            </p>
          )}
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={handleBack}
          className="group mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
        >
          <ArrowRight
            size={17}
            strokeWidth={2}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          {backLabel}
        </button>
      </div>
    </div>
  );
};

export default NotFound;