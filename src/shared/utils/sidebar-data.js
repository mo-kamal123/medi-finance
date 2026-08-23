import {
    Calculator,
    FolderTree,
    FileText,
    Receipt,
    Users,
    Landmark,
    BarChart3,
    BookOpen,
    Scale,
    FileCheck,
    FileClock,
    CreditCard,
    Wallet,
    Banknote,
    Link2,
  } from 'lucide-react';

export const links = [
    {
      // accounting
      name: 'المحاسبة',
      icon: Calculator,
      sub: [
        { name: 'شجرة الحسابات', link: '/accounts-tree', icon: FolderTree },
        { name: 'شجرة التكاليف', link: '/cost-tree', icon: FolderTree },
        { name: 'ربط حساب بمركز تكلفة', link: '/link', icon: Link2 },
      ],
    },
    {
      // transactions
      name: 'المعاملات',
      icon: FileText,
      sub: [
        {
          name: 'الفواتير',
          icon: Receipt,
          sub: [
            {
              name: 'فواتير العملاء',
              link: '/customers-invoices',
              icon: FileCheck,
            },
            {
              name: 'فواتير الموردين',
              link: '/suppliers-invoices',
              icon: FileClock,
            },
            {
              name: 'فواتير المطالبات',
              link: '/batches-invoices',
              icon: FileClock,
            },
          ],
        },
        { name: 'القيود اليومية', link: '/entries', icon: FileText },
        { name: 'الصندوق', link: '/cash-transactions', icon: Wallet },
        { name: 'السندات', link: '/cash-vouchers', icon: Receipt },
        { name: 'الأوراق التجارية', link: '/commercial-papers', icon: FileCheck },
      ],
    },
    {
      // banking
      name: 'البنوك',
      icon: Landmark,
      sub: [
        { name: 'البنوك المتاحه', link: '/banks', icon: Landmark },
        { name: 'الشيكات', link: '/cheques', icon: CreditCard },
      ],
    },
    {
      // master-data
      name: 'البيانات الأساسية',
      icon: Users,
      sub: [
        { name: 'العملاء', link: '/customers', icon: Users },
        { name: 'المورديين', link: '/suppliers', icon: Users },
      ],
    },
    {
      // reports
      name: 'التقارير',
      icon: BarChart3,
      sub: [
        {
          // financial-statements
          name: 'القوائم المالية',
          icon: Scale,
          sub: [
            { name: 'الميزانية العمومية', link: '/balance-sheet', icon: Wallet },
            { name: 'قائمة الدخل', link: '/income-statement', icon: Banknote },
            { name: 'ميزان المراجعة', link: '/trial-balance', icon: Scale },
          ],
        },
        {
          // accounting reports
          name: 'تقارير محاسبية',
          icon: BookOpen,
          sub: [
            { name: 'حساب الأستاذ', link: '/general-ledger', icon: BookOpen },
            { name: 'كشف حساب عميل', link: '/general-ledger/customer', icon: Users },
            { name: 'كشف حساب مورد', link: '/general-ledger/supplier', icon: Users },
            { name: 'أعمار الذمم', link: '/aging-report', icon: BookOpen },
          ],
        },
      ],
    },
  ];