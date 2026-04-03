import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { dashboardApi, accountsApi } from '../../lib/api';
import { useStore } from '../../lib/store';
import { formatCurrency, formatShortCurrency } from '../../lib/currency';
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
  Target,
  Calendar
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

  const pieChartData = useMemo(() => {
    const seen = new Set<string>();
    return (dashboardData?.topCategories || []).map((cat: any, idx: number) => {
      let name = cat.categoryName || `Category ${idx + 1}`;
      // Ensure unique names for Recharts keys
      if (seen.has(name)) {
        name = `${name} (${idx + 1})`;
      }
      seen.add(name);
      // Add unique ID for Cell keys
      return { 
        id: `${cat.categoryId || 'cat'}-${idx}`, 
        name, 
        value: cat.amount, 
        color: cat.categoryColor 
      };
    });
  }, [dashboardData?.topCategories]);

  const savingsRate = dashboardData?.income > 0 
    ? ((dashboardData.income - dashboardData.expense) / dashboardData.income) * 100 
    : 0;

  // Generate trend data for last 6 months — use useMemo with stable values to avoid duplicate-key warnings in Recharts
  const trendData = useMemo(() => {
    // Stable placeholder values (no Math.random) so data is consistent across renders
    const placeholderIncomes = [11500000, 13200000, 10800000, 14600000, 12300000, 0];
    const placeholderExpenses = [8800000, 10200000, 7900000, 11300000, 9100000, 0];

    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const isCurrentMonth = i === 5;
      return {
        id: `${year}-${String(month).padStart(2, '0')}`,
        month: `T${month}/${year.toString().slice(-2)}`,
        income: isCurrentMonth && dashboardData ? dashboardData.income : placeholderIncomes[i],
        expense: isCurrentMonth && dashboardData ? dashboardData.expense : placeholderExpenses[i],
      };
    });
  }, [dashboardData?.income, dashboardData?.expense]);

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
      {/* Header with Gradient */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            {greeting()}, <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{user?.name?.split(' ').pop() || 'bạn'}</span> 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Tháng {new Date(currentMonth + '-01').toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/transactions">
          <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 text-white transition-all hover:scale-105">
            <Plus className="w-4 h-4 mr-2" />
            Thêm giao dịch
          </Button>
        </Link>
      </div>

      {/* Stats Cards with Modern Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Total Balance Card */}
        <Card className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-950 border-0 shadow-lg shadow-blue-100/50 dark:shadow-none rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 relative z-10">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Tổng tài sản
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center backdrop-blur-sm">
              <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 relative z-10">
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {formatShortCurrency(balance?.totalBalance || 0, false)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{balance?.accounts?.length || 0} tài khoản</p>
          </CardContent>
        </Card>

        {/* Income Card */}
        <Card className="relative bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-900 dark:to-emerald-950 border-0 shadow-lg shadow-emerald-100/50 dark:shadow-none rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 relative z-10">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Thu nhập
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 relative z-10">
            <p className="text-2xl lg:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              +{formatShortCurrency(dashboardData?.income || 0, false)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tháng này</p>
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card className="relative bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-red-950 border-0 shadow-lg shadow-red-100/50 dark:shadow-none rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 relative z-10">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              Chi tiêu
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center backdrop-blur-sm">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 relative z-10">
            <p className="text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
              -{formatShortCurrency(dashboardData?.expense || 0, false)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tháng này</p>
          </CardContent>
        </Card>

        {/* Savings Card */}
        <Card className={`relative bg-gradient-to-br ${
          savingsRate >= 0 
            ? 'from-violet-50 to-purple-50 dark:from-gray-900 dark:to-violet-950 shadow-violet-100/50' 
            : 'from-orange-50 to-amber-50 dark:from-gray-900 dark:to-orange-950 shadow-orange-100/50'
        } border-0 shadow-lg dark:shadow-none rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300`}>
          <div className={`absolute top-0 right-0 w-32 h-32 ${
            savingsRate >= 0 
              ? 'bg-gradient-to-br from-violet-400/20 to-purple-400/20' 
              : 'bg-gradient-to-br from-orange-400/20 to-amber-400/20'
          } rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 relative z-10">
            <CardTitle className={`text-xs font-semibold uppercase tracking-wider ${
              savingsRate >= 0 
                ? 'text-violet-600 dark:text-violet-400' 
                : 'text-orange-600 dark:text-orange-400'
            }`}>
              Tiết kiệm
            </CardTitle>
            <div className={`w-10 h-10 rounded-xl ${
              savingsRate >= 0 
                ? 'bg-violet-500/10 dark:bg-violet-500/20' 
                : 'bg-orange-500/10 dark:bg-orange-500/20'
            } flex items-center justify-center backdrop-blur-sm`}>
              <Target className={`w-5 h-5 ${
                savingsRate >= 0 
                  ? 'text-violet-600 dark:text-violet-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`} />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 relative z-10">
            <p className={`text-2xl lg:text-3xl font-bold mb-1 ${
              savingsRate >= 0 
                ? 'text-violet-600 dark:text-violet-400' 
                : 'text-orange-600 dark:text-orange-400'
            }`}>
              {savingsRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {savingsRate >= 20 ? '🎯 Xuất sắc!' : savingsRate >= 10 ? '👍 Tốt' : '💪 Cần cải thiện'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 bg-white dark:bg-gray-900/80 border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              Thu - Chi 6 tháng gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop key="income-stop-0" offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop key="income-stop-100" offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop key="expense-stop-0" offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop key="expense-stop-100" offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => formatShortCurrency(val, false)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Area key="income-area" type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={3} name="Thu nhập" dot={false} />
                <Area key="expense-area" type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={3} name="Chi tiêu" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-white dark:bg-gray-900/80 border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              Phân bổ chi tiêu
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieChartData.map((entry: any, index: number) => (
                      <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
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
                <div key={cat.categoryId || `category-${index}`} className="flex items-center gap-3">
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