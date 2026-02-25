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
import Pagination from '../../../shared/components/pagination';

const Home = () => {
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
      description: 'تسجيل القيود المحاسبية',
      icon: FileText,
      link: '/entries',
      color: 'bg-blue-500',
    },
    {
      title: 'التقارير المالية',
      description: 'عرض التقارير والتحليلات',
      icon: BarChart3,
      link: '/',
      color: 'bg-emerald-500',
    },
    {
      title: 'الفواتير',
      description: 'اداره الفواتير للعملاء والمورديين',
      icon: Calculator,
      link: '/invoices',
      color: 'bg-purple-500',
    },
  ];

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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return <StatisticsCard stat={stat} Icon={Icon} key={index} />;
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <QuickActionsSection quickActions={quickActions} />

        {/* Recent Activity */}
        <RecentActivitySection recentActivity={recentActivity} />
      </div>

      {/* System Overview */}
      <SystemOverviewSection />
    </div>
  );
};

export default Home;
