import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { accountSchema } from "../validation/accounts-validation";
import FormInput from "../../../../shared/ui/input";



const AccountForm = ({
  mode = "create",
  defaultValues = {},
  parentAccounts = [],
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      parentID: 0,
      isActive: true,
      isFinal: false,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      <FormInput
        label="رقم الحساب"
        {...register("accountCode")}
        error={errors.accountCode?.message}
        disabled={mode === "update"} // منع التعديل عند التحديث
      />

      <FormInput
        label="الاسم بالعربية"
        {...register("nameAr")}
        error={errors.nameAr?.message}
      />

      <FormInput
        label="الاسم بالإنجليزية"
        {...register("nameEn")}
        error={errors.nameEn?.message}
      />

      {/* Parent */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          الحساب الأب
        </label>
        <select
          {...register("parentID")}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value={0}>بدون</option>
          {parentAccounts.map((acc) => (
            <option key={acc.accountID} value={acc.accountID}>
              {acc.accountCode} - {acc.nameAr}
            </option>
          ))}
        </select>
      </div>

      {/* Type */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          نوع الحساب
        </label>
        <select
          {...register("accountType")}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">اختر النوع</option>
          <option value="asset">أصول</option>
          <option value="liability">خصوم</option>
          <option value="equity">حقوق ملكية</option>
          <option value="revenue">إيرادات</option>
          <option value="expense">مصروفات</option>
        </select>

        {errors.accountType && (
          <p className="mt-1 text-sm text-red-500">
            {errors.accountType.message}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
          <input type="checkbox" {...register("isActive")} />
          <span>الحساب نشط</span>
        </label>

        <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
          <input type="checkbox" {...register("isFinal")} />
          <span>حساب نهائي</span>
        </label>
      </div>

      <FormInput
        label="المستخدم"
        {...register("user")}
        error={errors.user?.message}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:opacity-90 transition disabled:opacity-60"
      >
        <Save size={18} />
        {isSubmitting
          ? "جاري الحفظ..."
          : mode === "create"
          ? "إنشاء الحساب"
          : "حفظ التعديلات"}
      </button>
    </form>
  );
};

export default AccountForm;
