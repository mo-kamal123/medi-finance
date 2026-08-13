import { useEffect, useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Loader2,
  Lock,
} from 'lucide-react';
import AccountActionsMenu from './account-actions-menu';

const getNodeId = (node) => node.id ?? node.accountID ?? node.costCenterID;

const TreeNode = ({
  node,
  level = 0,
  expandedAll,
  getLabel,
  getCode,
  getChildren,
  getParentId,
  actions = [],
  onExpand,
  isLoading,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const children = getChildren(node);
  const hasChildren = node.hasChildren ?? (children && children.length > 0);
  const loading = isLoading?.(node) ?? false;
  const resolvedChildren = children && children.length > 0 ? children : [];

  useEffect(() => {
    if (expandedAll !== null) {
      setIsExpanded(expandedAll);
    }
  }, [expandedAll]);

  const isMain = !getParentId(node);

  const paddingLeft = level * 24;

  const bgClass = isExpanded && isMain ? 'bg-gray-100 hover:bg-gray-100' : '';

  const handleClick = async () => {
    if (!hasChildren || loading) return;
    if (!isExpanded) {
      if (onExpand) {
        await onExpand(node);
      }
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-2">
      <div
        className={`
          flex items-center gap-2 py-2 px-3 rounded-lg transition-colors cursor-pointer
          hover:bg-gray-50
          ${bgClass}
        `}
        style={{ paddingInlineStart: `${paddingLeft + 12}px` }}
        onClick={handleClick}
      >
        {/* Expand */}
        {hasChildren ? (
          <div className="w-5 h-5 flex items-center justify-center">
            {loading ? (
              <Loader2 size={16} className="animate-spin text-primary" />
            ) : isExpanded ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronRight size={16} className="text-gray-400" />
            )}
          </div>
        ) : (
          <div className="w-5 h-5" />
        )}

        {/* Icon */}
        {loading ? (
          <FolderOpen size={18} className="text-primary" />
        ) : hasChildren ? (
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

        {/* Locked in journal */}
        {node.lockedInJournal ? (
          <span
            className="flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-amber-600"
            title="هذا الحساب مقفل ولا يمكن استخدامه في القيود"
          >
            <Lock size={12} />
            <span className="text-[10px] font-semibold">مقفل</span>
          </span>
        ) : null}

        {/* Menu */}
        {actions.length > 0 && <AccountActionsMenu node={node} actions={actions} />}
      </div>

      {hasChildren && isExpanded && resolvedChildren.length > 0 && (
        <div>
          {resolvedChildren.map((child) => (
            <TreeNode
              key={getNodeId(child)}
              node={child}
              level={level + 1}
              expandedAll={expandedAll}
              getLabel={getLabel}
              getCode={getCode}
              getChildren={getChildren}
              getParentId={getParentId}
              actions={actions}
              onExpand={onExpand}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
