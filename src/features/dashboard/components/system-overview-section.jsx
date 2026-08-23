import { BarChart3, FileText, Users } from 'lucide-react';

const SystemOverviewSection = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        نظرة عامة على النظام
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 rounded-lg bg-gray-50">
          <Users size={32} className="text-primary mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">إدارة المستخدمين</h3>
          <p className="text-sm text-gray-600">
            إدارة المستخدمين والصلاحيات بكفاءة
          </p>
        </div>
        <div className="text-center p-4 rounded-lg bg-gray-50">
          <FileText size={32} className="text-primary mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">المحاسبة</h3>
          <p className="text-sm text-gray-600">
            نظام محاسبي متكامل لإدارة الحسابات
          </p>
        </div>
        <div className="text-center p-4 rounded-lg bg-gray-50">
          <BarChart3 size={32} className="text-primary mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">التقارير</h3>
          <p className="text-sm text-gray-600">
            تقارير مالية شاملة وتحليلات متقدمة
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemOverviewSection;
