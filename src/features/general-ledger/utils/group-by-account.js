export const groupByAccount = (data) => {
  return data.reduce((acc, item) => {
    if (!acc[item.AccountID]) {
      acc[item.AccountID] = [];
    }

    acc[item.AccountID].push(item);
    return acc;
  }, {});
};
