export const buildTree = (items, { idKey, parentKey, sortKey }) => {
  const map = new Map();
  const roots = [];

  // create nodes
  items.forEach((item) => {
    map.set(item[idKey], { ...item, children: [] });
  });

  // build tree
  items.forEach((item) => {
    const node = map.get(item[idKey]);
    const parentId = item[parentKey];

    if (!parentId) {
      roots.push(node);
    } else {
      const parent = map.get(parentId);
      parent ? parent.children.push(node) : roots.push(node);
    }
  });

  // sort
  const sortNodes = (nodes) => {
    nodes.sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])));

    nodes.forEach((n) => {
      if (n.children?.length) sortNodes(n.children);
    });
  };

  sortNodes(roots);
  return roots;
};
