import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

const Breadcrumb = ({ items = [], home = { label: 'الرئيسية', to: '/' } }) => {
  const crumbs = [home, ...items];

  return (
    <nav aria-label="breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {crumbs.map((item, index) => {
          const isLast = index === crumbs.length - 1;
          const Icon = index === 0 ? Home : null;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? <ChevronLeft size={14} className="text-gray-300" /> : null}

              {isLast || !item.to ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={`flex items-center gap-1 ${
                    isLast ? 'font-semibold text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {Icon ? <Icon size={14} /> : null}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="flex items-center gap-1 text-gray-500 transition-colors hover:text-primary"
                >
                  {Icon ? <Icon size={14} /> : null}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
