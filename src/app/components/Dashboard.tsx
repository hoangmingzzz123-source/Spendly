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
  Activity
} from 'lucide-react';
import { Link } from 'react-router';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

export function Dashboard() {
  const { currentMonth } = useStore();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard', currentMonth],
    queryFn: () => dashboardApi.getSummary(currentMonth),
  });

  const { data: balanceData } = useQuery({
    queryKey: ['accounts', 'balance'],
    queryFn: () => accountsApi.getBalance(),
  });

  const dashboardData = summary?.data;
  const balance = balanceData?.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  const pieChartData = dashboardData?.topCategories?.map((cat: any) => ({
    name: cat.categoryName,
    value: cat.amount,
    color: cat.categoryColor,
  })) || [];

  // Calculate savings rate
  const savingsRate = dashboardData?.income > 0 
    ? ((dashboardData.income - dashboardData.expense) / dashboardData.income) * 100 
    : 0;

  // Mock trend data for the past 6 months
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthStr = date.toLocaleDateString('vi-VN', { month: 'short' });
    
    return {
      month: monthStr,
      income: Math.random() * 20000000 + 10000000,
      expense: Math.random() * 15000000 + 8000000,
    };
  });

  // Set current month data
  if (dashboardData) {
    trendData[5] = {
      month: trendData[5].month,
      income: dashboardData.income,
      expense: dashboardData.expense,
    };
  }

  if (summaryLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
            Tổng quan
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tháng {currentMonth}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/transactions">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Thêm giao dịch
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Tổng tài sản
            </CardTitle>
            <Wallet className="w-4 h-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(balance?.totalBalance || 0)}
            </div>
            <p className="text-xs text-white/80 mt-1">
              Từ {balance?.accounts?.length || 0} tài khoản
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Thu nhập
            </CardTitle>
            <ArrowUpCircle className="w-4 h-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.income || 0)}
            </div>
            <p className="text-xs text-white/80 mt-1">
              Tháng này
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Chi tiêu
            </CardTitle>
            <ArrowDownCircle className="w-4 h-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.expense || 0)}
            </div>
            <p className="text-xs text-white/80 mt-1">
              Tháng này
            </p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${
          savingsRate >= 0 ? 'from-purple-500 to-purple-600' : 'from-orange-500 to-orange-600'
        } text-white border-0`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Tỷ lệ tiết kiệm
            </CardTitle>
            <Activity className="w-4 h-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {savingsRate.toFixed(1)}%
            </div>
            <p className="text-xs text-white/80 mt-1">
              {savingsRate >= 20 ? 'Xuất sắc!' : savingsRate >= 10 ? 'Tốt' : 'Cần cải thiện'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Xu hướng Thu - Chi (6 tháng)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={formatShortCurrency}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                  name="Thu nhập"
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stackId="2"
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.6}
                  name="Chi tiêu"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Categories Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ chi tiêu</CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                Chưa có dữ liệu giao dịch
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chi tiết theo danh mục</CardTitle>
            <Link to="/timeline">
              <Button variant="ghost" size="sm">Xem tất cả</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.topCategories?.slice(0, 5).map((cat: any) => {
                const percentage = dashboardData.expense > 0 
                  ? (cat.amount / dashboardData.expense) * 100 
                  : 0;
                
                return (
                  <div key={cat.categoryId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: cat.categoryColor }}
                        >
                          <span className="text-sm font-medium">
                            {cat.categoryName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {cat.categoryName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {cat.count} giao dịch
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(cat.amount)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: cat.categoryColor 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {(!dashboardData?.topCategories || dashboardData.topCategories.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Chưa có giao dịch nào
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Accounts Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tài khoản của bạn</CardTitle>
            <Link to="/accounts">
              <Button variant="ghost" size="sm">Quản lý</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {balance?.accounts?.slice(0, 5).map((account: any) => (
                <div key={account.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: account.color + '20' }}
                    >
                      <span style={{ color: account.color }}>💳</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {account.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {account.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(account.balance || 0)}
                    </p>
                  </div>
                </div>
              ))}
              
              {(!balance?.accounts || balance.accounts.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Chưa có tài khoản nào</p>
                  <Link to="/accounts">
                    <Button variant="outline" size="sm" className="mt-3">
                      Tạo tài khoản
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/budgets">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <TrendingUp className="w-6 h-6" />
                <span className="text-sm">Ngân sách</span>
              </Button>
            </Link>
            <Link to="/goals">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <Activity className="w-6 h-6" />
                <span className="text-sm">Mục tiêu</span>
              </Button>
            </Link>
            <Link to="/chat">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">AI Chat</span>
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <Wallet className="w-6 h-6" />
                <span className="text-sm">Cài đặt</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}