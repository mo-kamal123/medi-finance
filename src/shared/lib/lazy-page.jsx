import { lazy, Suspense } from 'react';
import PageLoader from '../ui/page-loader';

export const lazyPage = (importer, loaderLabel) => {
  const LazyComponent = lazy(importer);

  return (
    <Suspense fallback={<PageLoader label={loaderLabel} />}>
      <LazyComponent />
    </Suspense>
  );
};
