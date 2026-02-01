import { BarChart3 } from 'lucide-react';

const WelcomeSection = () => {
  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            مرحباً بك في Medi Finance
          </h1>
          <p className="text-white/90 text-sm sm:text-base">
            نظام محاسبي متكامل لإدارة شؤونك المالية بكفاءة
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
          <BarChart3 size={24} />
          <span className="font-semibold">لوحة التحكم</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
