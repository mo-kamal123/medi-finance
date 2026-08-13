import { useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import Dropdown from '../../../shared/ui/dropdown';

const AccountActionsMenu = ({ node, actions }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(!isMenuOpen);
        }}
        className="p-1 rounded hover:bg-gray-200"
      >
        <MoreVertical size={16} />
      </button>

      <Dropdown
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorRef={menuRef}
      >
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              type="button"
              key={i}
              onClick={() => {
                action.onClick(node);
                setIsMenuOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                action.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {Icon ? (
                <Icon
                  size={15}
                  className={action.danger ? 'text-red-500' : 'text-gray-400'}
                />
              ) : null}
              {action.label}
            </button>
          );
        })}
      </Dropdown>
    </div>
  );
};

export default AccountActionsMenu;
