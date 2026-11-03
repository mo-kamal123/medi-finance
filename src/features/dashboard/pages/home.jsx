import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  BarChart3,
  Calculator,
  FolderTree,
} from 'lucide-react';
import WelcomeSection from '../components/welcome-section';
import StatisticsCard from '../components/statistics-card';
import QuickActionsSection from '../components/quick-actions-section';
import RecentActivitySection from '../components/recent-activity-section';
import SystemOverviewSection from '../components/system-overview-section';
import { useOutletContext } from 'react-router-dom';
import { canViewRoute, filterNavigation } from '../../auth/route-permissions';
import { links } from '../../../shared/utils/sidebar-data';

const getModuleShortcuts = (items) =>
  items.flatMap(({ name, link, icon, sub }) =>
    sub
      ? getModuleShortcuts(sub)
      : link === '/'
        ? []
        : [{ title: name, link, icon, color: 'bg-primary' }]
  );

const Home = () => {
  const permissions = useOutletContext();
  if (permissions?.Dashboard?.View !== true) {
    const modules = getModuleShortcuts(filterNavigation(links, permissions));

    return (
      <div className="space-y-6">
        <WelcomeSection isDashboard={false} />
        {modules.length > 0 ? (
          <QuickActionsSection
            title="الأقسام المتاحة لك"
            quickActions={modules}
          />
        ) : (
          permissions && (
            <p className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
              لا توجد أقسام متاحة لحسابك حالياً.
            </p>
          )
        )}
      </div>
    );
  }
  // Sample data - replace with real data from your API
  const stats = [
    {
      title: 'إجمالي الإيرادات',
      value: '125,430',
      currency: 'ج.م',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'إجمالي المصروفات',
      value: '89,200',
      currency: 'ج.م',
      change: '-5.2%',
      trend: 'down',
      icon: TrendingDown,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: 'صافي الربح',
      value: '36,230',
      currency: 'ج.م',
      change: '+18.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'عدد الحسابات',
      value: '1,247',
      change: '+24',
      trend: 'up',
      icon: FolderTree,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
  ];

  const quickActions = [
    {
      title: 'شجرة الحسابات',
      description: 'إدارة الحسابات والتصنيفات',
      icon: FolderTree,
      link: '/accounts-tree',
      color: 'bg-primary',
    },
    {
      title: 'القيود اليومية',
      description: 'عرض القيود المحاسبية',
      icon: FileText,
      link: '/entries',
      color: 'bg-blue-500',
    },
    {
      title: 'ميزان المراجعة',
      description: 'عرض تقرير ميزان المراجعة',
      icon: BarChart3,
      link: '/trial-balance',
      color: 'bg-emerald-500',
    },
    {
      title: 'فواتير العملاء',
      description: 'عرض فواتير العملاء',
      icon: Calculator,
      link: '/customers-invoices',
      color: 'bg-purple-500',
    },
  ].filter(({ link }) => canViewRoute(permissions, link));

  const recentActivity = [
    {
      id: 1,
      type: 'قيد',
      description: 'قيد يومي جديد - رقم 001',
      time: 'منذ ساعتين',
    },
    {
      id: 2,
      type: 'حساب',
      description: 'تم إنشاء حساب جديد',
      time: 'منذ 4 ساعات',
    },
    {
      id: 3,
      type: 'تقرير',
      description: 'تقرير مالي تم إنشاؤه',
      time: 'منذ يوم',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeSection />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatisticsCard key={stat.title} stat={stat} Icon={stat.icon} />
        ))}
      </div>

      <div
        className={
          quickActions.length ? 'grid gap-6 lg:grid-cols-3' : undefined
        }
      >
        {quickActions.length > 0 && (
          <QuickActionsSection quickActions={quickActions} />
        )}
        <RecentActivitySection recentActivity={recentActivity} />
      </div>

      <SystemOverviewSection />
    </div>
  );
};

export default Home;
