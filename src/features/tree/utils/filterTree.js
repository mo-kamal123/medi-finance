  // Filter accounts based on search and type
  export const filterTree = (accounts, query, type) => {
    if (!query && type === 'all') return accounts;

    return accounts
      .map((account) => {
        const matchesSearch =
          !query ||
          account.nameAr.toLowerCase().includes(query.toLowerCase()) ||
          account.nameEn.toLowerCase().includes(query.toLowerCase()) ||
          account.accountCode.includes(query);

        const matchesType = type === 'all' || account.accountType === type;

        const filteredChildren = account.children
          ? filterTree(account.children, query, type)
          : [];

        if (matchesSearch && matchesType) {
          return { ...account, children: filteredChildren };
        } else if (filteredChildren.length > 0) {
          return { ...account, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean);
  };