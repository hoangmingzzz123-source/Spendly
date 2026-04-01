import { useQuery } from '@tanstack/react-query';
import { dashboardApi, accountsApi } from '../../lib/api';
import { useStore } from '../../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  Activity,
  Sparkles,
  ArrowRight,
  ReceiptText
} from 'lucide-react';
import { Link } from 'react-router';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316'];

export function Dashboard() {
  const { currentMonth, user, accessToken } = useStore();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard', currentMonth],
    queryFn: () => dashboardApi.getSummary(currentMonth),
    enabled: !!accessToken,
  });

  const { data: balanceData } = useQuery({
    queryKey: ['accounts', 'balance'],
    queryFn: () => accountsApi.getBalance(),
    enabled: !!accessToken,
  });

  const dashboardData = summary?.data;
  const balance = balanceData?.data;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toString();
  };

  const pieChartData = dashboardData?.topCategories?.map((cat: any) => ({
    name: cat.categoryName,
    value: cat.amount,
    color: cat.categoryColor,
  })) || [];

  const savingsRate = dashboardData?.income > 0 
    ? ((dashboardData.income - dashboardData.expense) / dashboardData.income) * 100 
    : 0;

  const trendData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      key: `month-${i}`,
      month: `Th${date.getMonth() + 1}`,
      income: Math.random() * 20000000 + 10000000,
      expense: Math.random() * 15000000 + 8000000,
    };
  });

  if (dashboardData) {
    trendData[5] = { ...trendData[5], income: dashboardData.income, expense: dashboardData.expense };
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  if (summaryLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 bg-gray-200/60 dark:bg-gray-800 rounded-xl w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-gray-200/60 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 bg-gray-200/60 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            {greeting()}, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{user?.name?.split(' ').pop() || 'bạn'}</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tháng {new Date(currentMonth + '-01').toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/transactions">
          <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Thêm giao dịch
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="bg-white dark:bg-gray-900/80 border-0 shadow-sm shadow-blue-100/50 dark:shadow-none rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Tổng tài sản
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {formatShortCurrency(balance?.totalBalance || 0)}
              <span className="text-xs font-normal text-gray-400 ml-1">VNĐ</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">{balance?.accounts?.length || 0} tài khoản</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900/80 border-0 shadow-sm shadow-green-100/50 dark:shadow-none rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Thu nhập
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <ArrowUpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +{formatShortCurrency(dashboardData?.income || 0)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Tháng này</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900/80 border-0 shadow-sm shadow-red-100/50 dark:shadow-none rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Chi tiêu
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <ArrowDownCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl lg:text-2xl font-bold text-red-500 dark:text-red-400">
              -{formatShortCurrency(dashboardData?.expense || 0)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Tháng này</p>
          </CardContent>
        </Card>

        <Card className={`bg-white dark:bg-gray-900/80 border-0 shadow-sm rounded-2xl overflow-hidden ${
          savingsRate >= 0 ? 'shadow-violet-100/50' : 'shadow-orange-100/50'
        } dark:shadow-none`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Tiết kiệm
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className={`text-xl lg:text-2xl font-bold ${savingsRate >= 0 ? 'text-violet-600 dark:text-violet-400' : 'text-orange-500'}`}>
              {savingsRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {savingsRate >= 20 ? 'Xuất sắc!' : savingsRate >= 10 ? 'Tốt' : 'Cần cải thiện'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 bg-white dark:bg-gray-900/80 border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Thu - Chi 6 tháng
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatShortCurrency} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Legend />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2.5} name="Thu nhập" dot={false} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2.5} name="Chi tiêu" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-white dark:bg-gray-900/80 border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Phân bổ chi tiêu</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieChartData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
                <Sparkles className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">Chưa có dữ liệu</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Categories */}
        <Card className="bg-white dark:bg-gray-900/80 border-0 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Chi tiết danh mục</CardTitle>
            <Link to="/timeline">
              <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 text-xs rounded-lg">
                Xem tất cả <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData?.topCategories?.slice(0, 5).map((cat: any, index: number) => {
              const pct = dashboardData.expense > 0 ? (cat.amount / dashboardData.expense) * 100 : 0;
              return (
                <div key={cat.categoryId} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {cat.categoryName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{cat.categoryName}</span>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">
                        {formatShortCurrency(cat.amount)}đ
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[index % COLORS.length] }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {(!dashboardData?.topCategories || dashboardData.topCategories.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Chưa có giao dịch nào</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accounts */}
        <Card className="bg-white dark:bg-gray-900/80 border-0 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Tài khoản</CardTitle>
            <Link to="/accounts">
              <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 text-xs rounded-lg">
                Quản lý <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {balance?.accounts?.slice(0, 5).map((account: any) => (
              <div key={account.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 hover:bg-gray-100/80 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: (account.color || '#6366f1') + '15' }}
                  >
                    <Wallet className="w-4 h-4" style={{ color: account.color || '#6366f1' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{account.name}</p>
                    <p className="text-xs text-gray-400">{account.type}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(account.balance || 0)}</p>
              </div>
            ))}
            {(!balance?.accounts || balance.accounts.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <Wallet className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm mb-3">Chưa có tài khoản</p>
                <Link to="/accounts">
                  <Button size="sm" variant="outline" className="rounded-xl">Tạo tài khoản</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/budgets', icon: TrendingUp, label: 'Ngân sách', color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
          { to: '/goals', icon: Activity, label: 'Mục tiêu', color: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/20' },
          { to: '/chat', icon: Sparkles, label: 'AI Chat', color: 'from-indigo-500 to-blue-500', shadow: 'shadow-indigo-500/20' },
          { to: '/ocr', icon: BarChart3, label: 'Quét bill', color: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20' },
          { to: '/bill', icon: ReceiptText, label: 'Chia bill', color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
        ].map((action) => (
          <Link key={action.to} to={action.to}>
            <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.color} p-4 lg:p-5 text-white shadow-lg ${action.shadow} hover:scale-[1.02] transition-transform cursor-pointer`}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
              <action.icon className="w-6 h-6 mb-2" />
              <p className="text-sm font-semibold">{action.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}