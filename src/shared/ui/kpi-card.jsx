import { cn } from '../lib/cn';

// Values are formatted by the caller so counts, currencies and status text keep
// their existing meaning while sharing one presentation.
const KpiCard = ({
  label,
  value,
  tone = 'text-primary',
  dotClassName,
  icon: Icon,
  accessory,
  unit,
  secondary,
  valueDir = 'ltr',
  className,
}) => (
  <dl
    className={cn('min-w-0 rounded-xl border border-gray-200 p-6', className)}
  >
    <dt className="flex items-center gap-2 text-xs text-gray-600">
      {Icon ? (
        <Icon size={18} aria-hidden="true" className={cn('shrink-0', tone)} />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            dotClassName || 'bg-current',
            !dotClassName && tone
          )}
        />
      )}
      <span className="min-w-0 flex-1">{label}</span>
      {accessory}
    </dt>
    <dd className="mt-3 flex min-w-0 flex-wrap items-baseline gap-x-2">
      <span
        dir={valueDir}
        className={cn(
          'inline-block max-w-full wrap-break-word text-2xl font-semibold tabular-nums sm:text-3xl',
          tone
        )}
      >
        {value ?? '-'}
      </span>
      {unit && (
        <span className="text-sm font-medium text-gray-500">{unit}</span>
      )}
    </dd>
    {secondary != null && (
      <dd
        className={cn(
          'mt-2 wrap-break-word text-sm font-semibold tabular-nums',
          tone
        )}
      >
        {secondary}
      </dd>
    )}
  </dl>
);

export default KpiCard;
