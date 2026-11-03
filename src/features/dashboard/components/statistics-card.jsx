import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const StatisticsCard = ({ stat }) => {
  const MetricIcon = stat.icon;
  const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5">
      <dt className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl ${stat.tone}`}
        >
          <MetricIcon size={19} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">{stat.title}</span>
        <span
          dir="ltr"
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold tabular-nums ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
        >
          <TrendIcon size={14} aria-hidden="true" />
          {stat.change}
        </span>
      </dt>
      <dd className="mt-4 flex flex-wrap items-baseline gap-x-2">
        <bdi className="text-3xl font-bold leading-none text-gray-900 tabular-nums">
          {stat.value}
        </bdi>
        {stat.currency && (
          <span className="text-sm font-medium text-gray-500">
            {stat.currency}
          </span>
        )}
      </dd>
    </div>
  );
};

export default StatisticsCard;
