import { useState } from 'react';
import AuthForm from '../components/auth-form';
import { useLogin } from '../hooks/useLogin';

const Login = () => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const {mutate: login}  = useLogin()
  const handleChange = (inputKey, value) => {
    setLoginData((prev) => ({
      ...prev,
      [inputKey]: value, // dynamic key
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(loginData)
    console.log(loginData);
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 space-y-8 max-w-md mx-auto">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">تسجيل الدخول</h1>
        <p className="text-gray-600 text-sm">
          أهلاً بك، الرجاء إدخال بياناتك
        </p>
      </div>

      {/* Form */}
      <AuthForm
        onChange={handleChange}
        loginData={loginData}
        onSubmit={handleSubmit}
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
