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

export const GRID_COLUMNS = 'minmax(200px, 2fr) 120px 100px 100px 50px';

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

  const indentPx = level * 24 + 12;

  return (
    <div className="relative">
      {/* Row */}
      <div
        className="grid items-center border-b border-gray-200 py-3 px-3 cursor-pointer hover:bg-gray-50 transition-colors"
        style={{
          gridTemplateColumns: GRID_COLUMNS,
          paddingInlineStart: `${indentPx}px`,
          paddingInlineEnd: '12px',
        }}
        onClick={handleClick}
      >
        {/* Name */}
        <div className="flex items-center gap-2 min-w-0">
          {hasChildren ? (
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              {loading ? (
                <Loader2 size={16} className="animate-spin text-primary" />
              ) : isExpanded ? (
                <ChevronDown size={16} className="text-gray-400" />
              ) : (
                <ChevronRight size={16} className="text-gray-400" />
              )}
            </div>
          ) : (
            <div className="w-5 h-5 shrink-0" />
          )}
          {loading ? (
            <FolderOpen size={18} className="text-primary shrink-0" />
          ) : hasChildren ? (
            isExpanded ? (
              <FolderOpen size={18} className="text-primary shrink-0" />
            ) : (
              <Folder size={18} className="text-gray-400 shrink-0" />
            )
          ) : (
            <FileText size={18} className="text-gray-400 shrink-0" />
          )}
          <span className="text-base font-semibold text-gray-900 truncate">
            {getLabel(node)}
          </span>
        </div>

        {/* Code */}
        <span className="text-sm font-mono text-gray-500 truncate">
          {getCode(node)}
        </span>

        {/* Status */}
        <span className={`text-sm font-medium ${node.isActive !== false ? 'text-emerald-600' : 'text-red-500'}`}>
          {node.isActive !== false ? 'نشط' : 'غير نشط'}
        </span>

        {/* Locked in Journal */}
        {node.lockedInJournal ? (
          <span
            className="flex items-center gap-1 text-amber-600"
            title="هذا الحساب مقفل ولا يمكن استخدامه في القيود"
          >
            <Lock size={12} />
            <span className="text-[10px] font-semibold">مقفل</span>
          </span>
        ) : (
          <span className="text-sm text-gray-300">-</span>
        )}

        {/* Actions */}
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          {actions.length > 0 && <AccountActionsMenu node={node} actions={actions} />}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && resolvedChildren.length > 0 && (
        <div className="relative">
          {/* Vertical line running through all children */}
          <div
            className="absolute top-0 bottom-0 w-px bg-gray-200"
            style={{ insetInlineStart: `${indentPx}px` }}
          />
          {resolvedChildren.map((child) => (
            <div key={getNodeId(child)} className="relative">
              {/* Horizontal connector line */}
              <div
                className="absolute h-px bg-gray-200"
                style={{
                  insetInlineStart: `${indentPx}px`,
                  top: '16px',
                  width: '24px',
                }}
              />
              <TreeNode
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
