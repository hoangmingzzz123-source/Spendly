import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { timelineApi } from '../../lib/api';
import { useStore } from '../../lib/store';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function Timeline() {
  const { currentMonth, user, accessToken } = useStore();
  const [period, setPeriod] = useState('month');

  const { data, isLoading } = useQuery({
    queryKey: ['timeline', period, currentMonth],
    queryFn: () => timelineApi.get(period, currentMonth),
    enabled: !!accessToken,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const timeline = data?.data || [];

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
            Timeline
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Xem chi tiêu theo dòng thời gian
          </p>
        </div>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">7 ngày qua</SelectItem>
            <SelectItem value="month">Tháng này</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline Cards */}
      <div className="space-y-4">
        {timeline.map((day: any) => (
          <Card key={day.date} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-sm opacity-90">
                    {format(new Date(day.date), 'EEEE', { locale: vi })}
                  </p>
                  <p className="text-2xl font-bold">
                    {format(new Date(day.date), 'dd/MM/yyyy', { locale: vi })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Tổng chi tiêu</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(day.totalExpense)}
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              {/* Top Categories */}
              {day.topCategories && day.topCategories.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    Danh mục chi tiêu nhiều nhất
                  </p>
                  <div className="flex gap-2">
                    {day.topCategories.map((cat: any) => (
                      <div
                        key={cat.categoryId}
                        className="flex-1 p-2 rounded-lg text-white text-center"
                        style={{ backgroundColor: cat.color }}
                      >
                        <p className="text-xs opacity-90">{cat.name}</p>
                        <p className="font-semibold text-sm">
                          {formatCurrency(cat.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions List */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {day.transactions.length} giao dịch
                </p>
                {day.transactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: transaction.categoryColor }}
                      >
                        {transaction.type === 'INCOME' ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.categoryName}
                        </p>
                        {transaction.note && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {transaction.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      transaction.type === 'INCOME'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">{formatCurrency(day.totalIncome)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <TrendingDown className="w-5 h-5" />
                    <span className="font-semibold">{formatCurrency(day.totalExpense)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {timeline.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Chưa có giao dịch nào trong khoảng thời gian này
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}