export const commercialPapersKeys = {
  all: ['commercial-papers'],
  lists: (filters) => [...commercialPapersKeys.all, 'list', filters],
  detail: (id) => [...commercialPapersKeys.all, 'detail', id],
  banks: () => [...commercialPapersKeys.all, 'banks'],
  currencies: () => [...commercialPapersKeys.all, 'currencies'],
  financialPeriods: () => [...commercialPapersKeys.all, 'financial-periods'],
};
