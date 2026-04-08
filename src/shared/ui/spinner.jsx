import { LoaderCircle } from 'lucide-react';
import { cn } from '../lib/cn';

const Spinner = ({ className = '', size = 'md', label = 'Loading' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  };

  return (
    <LoaderCircle
      aria-label={label}
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    />
  );
};

export default Spinner;
