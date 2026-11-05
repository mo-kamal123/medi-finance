import { useState } from 'react';
import AuthForm from '../components/auth-form';
import { useLogin } from '../hooks/useLogin';
import { useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/lib/toast';

const autofillData = {
  mobileNumber: "201000000099",
  password: "Fin!N5CTvbES6rwhhHyqs-xZ9a",
};

const Login = () => {
  const [loginData, setLoginData] = useState({
    mobileNumber: '',
    password: '',
  });
  const [searchParams] = useSearchParams();
  const { mutate: login, isPending, isError, error, reset } = useLogin();
  const handleChange = (inputKey, value) => {
    reset();
    setLoginData((prev) => ({
      ...prev,
      [inputKey]: value, // dynamic key
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPending) return;
    login(loginData);
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 space-y-8 max-w-md mx-auto">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">تسجيل الدخول</h1>
        <p className="text-gray-600 text-sm">
          {autofillData?.mobileNumber && autofillData.password ? (
            <button
              type="button"
              disabled={isPending}
              className="rounded hover:text-primary hover:underline focus-visible:outline-primary"
              aria-label="أهلاً بك، ملء بيانات تسجيل الدخول"
              onClick={() => {
                reset();
                setLoginData(autofillData);
              }}
            >
              أهلاً بك
            </button>
          ) : (
            'أهلاً بك'
          )}
          ، الرجاء إدخال بياناتك
        </p>
      </div>

      {/* Form */}
      {isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {typeof error?.response?.data === 'string' && error.response.data.trim()
            ? error.response.data
            : getErrorMessage(error, 'تعذر تسجيل الدخول، يرجى المحاولة مرة أخرى')}
        </div>
      ) : searchParams.get('sessionExpired') === '1' ? (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى
        </div>
      ) : null}
      <AuthForm
        onChange={handleChange}
        loginData={loginData}
        onSubmit={handleSubmit}
        isPending={isPending}
      />

      {/* Footer */}
      <div className="text-center text-sm text-gray-600">
        ليس لديك حساب؟{' '}
        <a
          href="/auth/register"
          className="text-primary font-medium hover:text-primary/80 transition-colors duration-200"
        >
          إنشاء حساب
        </a>
      </div>
    </div>
  );
};

export default Login;
