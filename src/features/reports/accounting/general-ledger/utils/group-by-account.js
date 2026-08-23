export const groupByAccount = (data) => {
  return data.reduce((acc, item) => {
    const key = item.accountID ?? item.AccountID;
    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});
};
