export const customersKeys = {
    all: ["customers"],
    lists: () => [...customersKeys.all, "list"],
    detail: (id) => [...customersKeys.all, id],
  };