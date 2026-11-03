import { NavLink } from 'react-router-dom';
import { ArrowLeft, LayoutGrid } from 'lucide-react';

const QuickActionsSection = ({
  quickActions,
  title = 'الإجراءات السريعة',
  fourColumns = false,
}) => (
  <section className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:p-6 lg:col-span-2">
    <div className="mb-4 flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <LayoutGrid size={18} aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <span
        aria-label={`عدد العناصر: ${quickActions.length}`}
        className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-600"
      >
        {quickActions.length}
      </span>
    </div>
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${fourColumns ? 'lg:grid-cols-4' : ''}`}
    >
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <NavLink
            key={action.link}
            to={action.link}
            className="group flex min-h-20 items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon size={19} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm leading-6 font-semibold text-gray-900 group-hover:text-primary">
                {action.title}
              </h3>
              {action.description && (
                <p className="text-xs text-gray-600">{action.description}</p>
              )}
            </div>
            <ArrowLeft
              size={16}
              className="shrink-0 text-gray-400 group-hover:text-primary"
              aria-hidden="true"
            />
          </NavLink>
        );
      })}
    </div>
  </section>
);

export default QuickActionsSection;
