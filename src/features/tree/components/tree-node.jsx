import { useEffect, useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  MoreVertical,
} from 'lucide-react';
import Dropdown from '../../../shared/ui/dropdown';

const TreeNode = ({
  node,
  level = 0,
  expandedAll,
  getLabel,
  getCode,
  getChildren,
  getParentId,
  actions = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const children = getChildren(node);
  const hasChildren = children && children.length > 0;

  useEffect(() => {
    if (expandedAll !== null) {
      setIsExpanded(expandedAll);
    }
  }, [expandedAll]);

  const isMain = !getParentId(node);

  const paddingLeft = level * 24;

  const bgClass = isExpanded && isMain ? 'bg-gray-100 hover:bg-gray-100' : '';

  return (
    <div className="relative flex flex-col gap-2">
      <div
        className={`
          flex items-center gap-2 py-2 px-3 rounded-lg transition-colors cursor-pointer
          hover:bg-gray-50
          ${bgClass}
        `}
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {/* Expand */}
        {hasChildren ? (
          <div className="w-5 h-5 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronRight size={16} className="text-gray-400" />
            )}
          </div>
        ) : (
          <div className="w-5 h-5" />
        )}

        {/* Icon */}
        {hasChildren ? (
          isExpanded ? (
            <FolderOpen size={18} className="text-primary" />
          ) : (
            <Folder size={18} className="text-gray-400" />
          )
        ) : (
          <FileText size={18} className="text-gray-400" />
        )}

        {/* Code */}
        <span className="text-sm font-mono text-gray-500 min-w-20">
          {getCode(node)}
        </span>

        {/* Name */}
        <span className="text-sm font-medium text-gray-900 flex-1">
          {getLabel(node)}
        </span>

        {/* Menu */}
        {actions.length > 0 && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1 rounded hover:bg-gray-200"
            >
              <MoreVertical size={16} />
            </button>

            <Dropdown isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
              {actions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => action.onClick(node)}
                  className={`w-full text-right px-3 py-2 text-sm hover:bg-gray-100 ${
                    action.danger ? 'text-red-600 hover:bg-red-50' : ''
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </Dropdown>
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedAll={expandedAll}
              getLabel={getLabel}
              getCode={getCode}
              getChildren={getChildren}
              getParentId={getParentId}
              actions={actions}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
