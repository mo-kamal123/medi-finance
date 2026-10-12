import { ArrowRight, House, FileQuestion, TriangleAlert } from 'lucide-react';
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from 'react-router-dom';

const RouteErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const Icon = isNotFound ? FileQuestion : TriangleAlert;

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10"
    >
      <section
        aria-labelledby="route-error-title"
        className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-10"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon size={38} aria-hidden="true" />
        </div>
        {isNotFound && (
          <p className="mb-2 text-sm font-semibold tracking-widest text-primary">
            404
          </p>
        )}
        <h1 id="route-error-title" className="text-2xl font-bold text-gray-900">
          {isNotFound ? 'الصفحة غير موجودة' : 'تعذر عرض الصفحة'}
        </h1>
        <p className="mt-3 leading-7 text-gray-500">
          {isNotFound
            ? 'قد يكون الرابط غير صحيح أو تم نقل الصفحة. يمكنك العودة إلى الصفحة السابقة لمتابعة عملك.'
            : 'حدث خطأ أثناء عرض هذه الصفحة. يمكنك العودة إلى الصفحة السابقة والمحاولة مرة أخرى.'}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-white transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ArrowRight size={18} aria-hidden="true" />
            العودة للصفحة السابقة
          </button>
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <House size={18} aria-hidden="true" />
            الصفحة الرئيسية
          </button>
        </div>
      </section>
    </main>
  );
};

export default RouteErrorPage;
