import { NavLink } from 'react-router-dom';

const QuickActionsSection = ({ quickActions }) => {
  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          الإجراءات السريعة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <NavLink
                key={index}
                to={action.link}
                className="group p-4 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`${action.color} p-2.5 rounded-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsSection;
