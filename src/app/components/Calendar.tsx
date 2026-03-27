import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi, categoriesApi } from '../../lib/api';
import { useStore } from '../../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { vi } from 'date-fns/locale';

export function Calendar() {
  const { user, accessToken } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'year'>('month');

  // Get date range based on view
  const getDateRange = () => {
    if (view === 'month') {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return {
        from: firstDay.toISOString().split('T')[0],
        to: lastDay.toISOString().split('T')[0],
      };
    }
    return {
      from: `${currentDate.getFullYear()}-01-01`,
      to: `${currentDate.getFullYear()}-12-31`,
    };
  };

  const dateRange = getDateRange();

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', dateRange.from, dateRange.to],
    queryFn: () => transactionsApi.getAll(dateRange),
    enabled: !!accessToken,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    enabled: !!accessToken,
  });

  const transactions = transactionsData?.data || [];
  const categories = categoriesData?.data || [];
  const categoryMap = new Map(categories.map((c: any) => [c.id, c]));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Group transactions by date
  const transactionsByDate = transactions.reduce((acc: any, t: any) => {
    if (!acc[t.date]) {
      acc[t.date] = { income: 0, expense: 0, count: 0, transactions: [] };
    }
    if (t.type === 'INCOME') {
      acc[t.date].income += t.amount;
    } else {
      acc[t.date].expense += t.amount;
    }
    acc[t.date].count += 1;
    acc[t.date].transactions.push(t);
    return acc;
  }, {});

  const navigatePrevious = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
    }
  };

  const navigateNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Lịch
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Xem giao dịch theo ngày/tháng/năm
          </p>
        </div>

        <Tabs value={view} onValueChange={(v: any) => setView(v)}>
          <TabsList>
            <TabsTrigger value="month">Tháng</TabsTrigger>
            <TabsTrigger value="year">Năm</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Navigation */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {view === 'month' 
                ? format(currentDate, 'MMMM yyyy', { locale: vi })
                : format(currentDate, 'yyyy', { locale: vi })
              }
            </h2>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Month View */}
      {view === 'month' && (
        <Card>
          <CardContent className="p-4">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                <div key={day} className="text-center font-semibold text-sm text-gray-600 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {eachDayOfInterval({
                start: startOfMonth(currentDate),
                end: endOfMonth(currentDate),
              }).map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayData = transactionsByDate[dateStr];
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={dateStr}
                    className={`min-h-[80px] p-2 border rounded-lg ${
                      isToday
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    } ${dayData ? 'hover:shadow-md cursor-pointer' : ''}`}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {format(day, 'd')}
                    </div>
                    {dayData && (
                      <div className="space-y-1">
                        {dayData.expense > 0 && (
                          <div className="text-xs text-red-600 dark:text-red-400 font-semibold truncate">
                            -{formatCurrency(dayData.expense).replace('₫', '')}
                          </div>
                        )}
                        {dayData.income > 0 && (
                          <div className="text-xs text-green-600 dark:text-green-400 font-semibold truncate">
                            +{formatCurrency(dayData.income).replace('₫', '')}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {dayData.count} GD
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Year View */}
      {view === 'year' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eachMonthOfInterval({
            start: startOfYear(currentDate),
            end: endOfYear(currentDate),
          }).map((month) => {
            const monthStr = format(month, 'yyyy-MM');
            const monthTransactions = transactions.filter((t: any) => t.date.startsWith(monthStr));
            const monthIncome = monthTransactions
              .filter((t: any) => t.type === 'INCOME')
              .reduce((sum: number, t: any) => sum + t.amount, 0);
            const monthExpense = monthTransactions
              .filter((t: any) => t.type === 'EXPENSE')
              .reduce((sum: number, t: any) => sum + t.amount, 0);

            return (
              <Card key={monthStr} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {format(month, 'MMMM', { locale: vi })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Thu nhập:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(monthIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Chi tiêu:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(monthExpense)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Số dư:</span>
                        <span className={`font-bold ${
                          monthIncome - monthExpense >= 0
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(monthIncome - monthExpense)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {monthTransactions.length} giao dịch
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}