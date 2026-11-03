const AuthForm = ({ loginData, onChange, onSubmit, isPending }) => {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          رقم الهاتف
        </label>
        <input
          type="tel"
          required
          autoComplete="username"
          placeholder="أدخل رقم الهاتف"
          value={loginData.mobileNumber}
          className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-start"
          onChange={(e) => onChange('mobileNumber', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          كلمة المرور
        </label>
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={loginData.password}
          className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-start"
          onChange={(e) => onChange('password', e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? 'جاري تسجيل الدخول...' : 'دخول'}
      </button>
    </form>
  );
};

export default AuthForm;
