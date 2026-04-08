import Spinner from './spinner';
import { cn } from '../lib/cn';

const PageLoader = ({ label = 'جاري التحميل...', className = '' }) => {
  return (
    <div
      className={cn(
        'flex min-h-[240px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white/80 p-8 text-center text-gray-600',
        className
      )}
    >
      <Spinner size="lg" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
};

export default PageLoader;
