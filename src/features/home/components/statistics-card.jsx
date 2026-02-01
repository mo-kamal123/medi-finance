import { ArrowDownRight, ArrowUpRight, Icon } from 'lucide-react';

const StatisticsCard = ({ stat, Icon }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`${stat.bgColor} ${stat.color} p-2.5 rounded-lg`}>
          <Icon size={20} className="text-white" />
        </div>
        {stat.trend === 'up' ? (
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
            <ArrowUpRight size={14} />
            <span>{stat.change}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
            <ArrowDownRight size={14} />
            <span>{stat.change}</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
      <p className="text-2xl font-bold text-gray-900">
        {stat.value}
        {stat.currency && (
          <span className="text-base text-gray-500 mr-1">{stat.currency}</span>
        )}
      </p>
    </div>
  );
};

export default StatisticsCard;
