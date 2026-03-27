import { useQuery } from '@tanstack/react-query';
import { dashboardApi, transactionsApi, budgetsApi, goalsApi } from '../../lib/api';
import { useStore } from '../../lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Target,
  PiggyBank,
  Calendar,
  Award,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export function Analytics() {
  const { currentMonth, user, accessToken } = useStore();

  const { data: summary } = useQuery({
    queryKey: ['dashboard', currentMonth],
    queryFn: () => dashboardApi.getSummary(currentMonth),
    enabled: !!accessToken,
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsApi.getAll(),
    enabled: !!accessToken,
  });

  const { data: budgetsData } = useQuery({
    queryKey: ['budgets', currentMonth],
    queryFn: () => budgetsApi.getAll(currentMonth),
    enabled: !!accessToken,
  });

  const { data: goalsData } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.getAll(),
    enabled: !!accessToken,
  });

  const dashboardData = summary?.data;
  const transactions = transactionsData?.data || [];
  const budgets = budgetsData?.data || [];
  const goals = goalsData?.data || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Calculate spending trends
  const calculateTrends = () => {
    const last30Days = transactions
      .filter((t: any) => {
        const date = new Date(t.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return date >= thirtyDaysAgo && t.type === 'EXPENSE';
      });

    const dailySpending = last30Days.reduce((acc: any, t: any) => {
      if (!acc[t.date]) acc[t.date] = 0;
      acc[t.date] += t.amount;
      return acc;
    }, {});

    return Object.entries(dailySpending).map(([date, amount]: any) => ({
      date: new Date(date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
      amount,
    })).slice(-14); // Last 14 days
  };

  const trendData = calculateTrends();

  // Calculate average daily spending
  const avgDailySpending = trendData.length > 0
    ? trendData.reduce((sum, item) => sum + item.amount, 0) / trendData.length
    : 0;

  // Generate AI insights
  const generateInsights = () => {
    const insights = [];

    // Spending insight
    const savingsRate = dashboardData?.income > 0 
      ? ((dashboardData.income - dashboardData.expense) / dashboardData.income) * 100 
      : 0;

    if (savingsRate < 10) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Tỷ lệ tiết kiệm thấp',
        description: `Bạn chỉ tiết kiệm được ${savingsRate.toFixed(1)}% thu nhập. Nên tiết kiệm ít nhất 20%.`,
        action: 'Xem cách cải thiện',
      });
    } else if (savingsRate >= 20) {
      insights.push({
        type: 'success',
        icon: Award,
        title: 'Tiết kiệm xuất sắc!',
        description: `Bạn đã tiết kiệm ${savingsRate.toFixed(1)}% thu nhập. Tiếp tục duy trì!`,
        action: 'Tạo mục tiêu mới',
      });
    }

    // Budget insights
    const overBudgets = budgets.filter((b: any) => b.percentage >= 100);
    if (overBudgets.length > 0) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Vượt ngân sách',
        description: `Bạn đã vượt ${overBudgets.length} ngân sách. Hãy cân nhắc điều chỉnh chi tiêu.`,
        action: 'Xem chi tiết',
      });
    }

    // Goals insights
    const activeGoals = goals.filter((g: any) => g.progress < 100);
    if (activeGoals.length > 0) {
      const avgProgress = activeGoals.reduce((sum: number, g: any) => sum + g.progress, 0) / activeGoals.length;
      insights.push({
        type: 'info',
        icon: Target,
        title: 'Tiến độ mục tiêu',
        description: `Bạn có ${activeGoals.length} mục tiêu đang thực hiện, trung bình đạt ${avgProgress.toFixed(0)}%.`,
        action: 'Cộng tiền',
      });
    }

    // Spending pattern
    const topCategory = dashboardData?.topCategories?.[0];
    if (topCategory && dashboardData.expense > 0) {
      const percentage = (topCategory.amount / dashboardData.expense) * 100;
      if (percentage > 40) {
        insights.push({
          type: 'info',
          icon: Lightbulb,
          title: 'Chi tiêu tập trung',
          description: `${topCategory.categoryName} chiếm ${percentage.toFixed(0)}% tổng chi tiêu. Có thể cân nhắc cắt giảm.`,
          action: 'Xem phân tích',
        });
      }
    }

    return insights;
  };

  const insights = generateInsights();

  // Calculate spending score
  const calculateScore = () => {
    let score = 50; // Base score

    // Savings rate (0-30 points)
    const savingsRate = dashboardData?.income > 0 
      ? ((dashboardData.income - dashboardData.expense) / dashboardData.income) * 100 
      : 0;
    score += Math.min(savingsRate * 1.5, 30);

    // Budget adherence (0-20 points)
    if (budgets.length > 0) {
      const withinBudget = budgets.filter((b: any) => b.percentage < 100).length;
      score += (withinBudget / budgets.length) * 20;
    }

    // Goals progress (0-20 points)
    if (goals.length > 0) {
      const avgProgress = goals.reduce((sum: number, g: any) => sum + g.progress, 0) / goals.length;
      score += (avgProgress / 100) * 20;
    }

    return Math.min(Math.round(score), 100);
  };

  const financialScore = calculateScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Phân tích & Insights</h1>
        <p className="text-muted-foreground">Hiểu rõ hơn về thói quen tài chính của bạn</p>
      </div>

      {/* Financial Health Score */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="w-6 h-6" />
              Điểm Sức khỏe Tài chính
            </span>
            <span className={`text-4xl font-bold ${getScoreColor(financialScore)}`}>
              {financialScore}/100
            </span>
          </CardTitle>
          <CardDescription>
            Dựa trên tiết kiệm, ngân sách và mục tiêu của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={financialScore} className="h-4" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Tỷ lệ tiết kiệm</p>
              <p className="font-semibold">{((dashboardData?.income - dashboardData?.expense) / (dashboardData?.income || 1) * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tuân thủ ngân sách</p>
              <p className="font-semibold">
                {budgets.length > 0 
                  ? `${budgets.filter((b: any) => b.percentage < 100).length}/${budgets.length}`
                  : 'Chưa có'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Tiến độ mục tiêu</p>
              <p className="font-semibold">
                {goals.length > 0 
                  ? `${(goals.reduce((sum: number, g: any) => sum + g.progress, 0) / goals.length).toFixed(0)}%`
                  : 'Chưa có'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Insights thông minh</h2>
        {insights.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Tài chính của bạn đang trong tình trạng tốt!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              const colors = {
                warning: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950',
                success: 'border-green-200 bg-green-50 dark:bg-green-950',
                info: 'border-blue-200 bg-blue-50 dark:bg-blue-950',
              };
              const iconColors = {
                warning: 'text-yellow-600',
                success: 'text-green-600',
                info: 'text-blue-600',
              };

              return (
                <Card key={index} className={colors[insight.type as keyof typeof colors]}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Icon className={`w-5 h-5 ${iconColors[insight.type as keyof typeof iconColors]}`} />
                      {insight.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">{insight.description}</p>
                    <button className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                      {insight.action}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Spending Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Xu hướng chi tiêu 14 ngày
          </CardTitle>
          <CardDescription>
            Chi tiêu trung bình: {formatCurrency(avgDailySpending)}/ngày
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Budget vs Actual */}
      {budgets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              So sánh Ngân sách vs Thực tế
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgets.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoryName" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#3B82F6" name="Ngân sách" />
                <Bar dataKey="spent" fill="#EF4444" name="Thực tế" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Số giao dịch tháng này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboardData?.transactionCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chi tiêu lớn nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {dashboardData?.topCategories?.[0] 
                ? formatCurrency(dashboardData.topCategories[0].amount)
                : '0 ₫'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {dashboardData?.topCategories?.[0]?.categoryName || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Số dư khả dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(dashboardData?.balance || 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Sau khi trừ chi tiêu
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}