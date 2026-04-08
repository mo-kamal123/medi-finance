let toastId = 0;
const listeners = new Set();

const DEFAULT_DURATION = 4000;

const emit = (toast) => {
  listeners.forEach((listener) => listener(toast));
};

const createToast = (type, message, options = {}) => {
  const toast = {
    id: ++toastId,
    type,
    message,
    title: options.title,
    duration: options.duration ?? DEFAULT_DURATION,
  };

  emit(toast);
  return toast.id;
};

export const subscribeToToasts = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const toast = {
  success: (message, options) => createToast('success', message, options),
  error: (message, options) => createToast('error', message, options),
  info: (message, options) => createToast('info', message, options),
};

export const getErrorMessage = (error, fallback = 'حدث خطأ غير متوقع') => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    error?.message ||
    fallback
  );
};
