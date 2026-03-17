export const commercialPapersKeys = {
    all: ['commercial-papers'],
    lists: (filters) => [...commercialPapersKeys.all, 'list', filters],
    detail: (id) => [...commercialPapersKeys.all, 'detail', id],
  };