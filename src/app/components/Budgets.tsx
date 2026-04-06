import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi, categoriesApi } from '../../lib/api';
import { useStore } from '../../lib/store';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Plus, TrendingUp, AlertTriangle, CheckCircle2, Edit2, Trash2, Lightbulb, Sparkles } from 'lucide-react';
import { SAMPLE_BUDGET_TEMPLATES } from '../../lib/sampleData';
import { Alert, AlertDescription } from './ui/alert';

export function Budgets() {
  const queryClient = useQueryClient();
  const { currentMonth, user, accessToken } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly',
  });
  const [loadingSample, setLoadingSample] = useState(false);

  // Fetch budgets
  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', currentMonth],
    queryFn: () => budgetsApi.getAll(currentMonth),
    enabled: !!accessToken,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    enabled: !!accessToken,
  });

  const budgets = budgetsData?.data || [];
  const categories = categoriesData?.data || [];
  const expenseCategories = categories.filter((c: any) => c.type === 'EXPENSE');
  const hasBudgets = budgets.length > 0;
  const hasCategories = expenseCategories.length > 0;

  // Create budget mutation
  const createMutation = useMutation({
    mutationFn: budgetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Ngân sách đã được tạo');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Không thể tạo ngân sách');
    },
  });

  // Update budget mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => budgetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Ngân sách đã được cập nhật');
      setDialogOpen(false);
      setEditingBudget(null);
      resetForm();
    },
    onError: () => {
      toast.error('Không thể cập nhật ngân sách');
    },
  });

  // Delete budget mutation
  const deleteMutation = useMutation({
    mutationFn: budgetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Ngân sách đã được xóa');
    },
    onError: () => {
      toast.error('Không thể xóa ngân sách');
    },
  });

  const resetForm = () => {
    setFormData({
      categoryId: '',
      amount: '',
      period: 'monthly',
    });
    setEditingBudget(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId || !formData.amount) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const budgetData = {
      categoryId: formData.categoryId,
      amount: formData.amount,
      month: currentMonth, // Add month field required by backend
    };

    if (editingBudget) {
      updateMutation.mutate({
        id: editingBudget.id,
        data: budgetData,
      });
    } else {
      createMutation.mutate(budgetData);
    }
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
      period: budget.period,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa ngân sách này?')) {
      deleteMutation.mutate(id);
    }
  };

  // Load sample budgets
  const loadSampleBudgets = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }
    
    if (!hasCategories) {
      toast.error('Vui lòng tạo danh mục chi tiêu trước');
      return;
    }

    setLoadingSample(true);
    try {
      for (const template of SAMPLE_BUDGET_TEMPLATES) {
        // Find matching category
        const category = expenseCategories.find((cat: any) => 
          cat.name.toLowerCase().includes(template.name.toLowerCase().split(' ')[0])
        );
        
        if (category) {
          await budgetsApi.create({
            categoryId: category.id,
            amount: template.amount.toString(),
            month: currentMonth,
          });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Đã tải ngân sách mẫu thành công! 🎉');
    } catch (error: any) {
      console.error('Load sample budgets error:', error);
      toast.error(error.message || 'Không thể tải ngân sách mẫu');
    } finally {
      setLoadingSample(false);
    }
  };

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100) return { color: 'destructive', icon: AlertTriangle, text: 'Vượt quá' };
    if (percentage >= 80) return { color: 'warning', icon: TrendingUp, text: 'Gần đạt' };
    return { color: 'success', icon: CheckCircle2, text: 'Tốt' };
  };

  const totalBudget = budgets.reduce((sum: number, b: any) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum: number, b: any) => sum + b.spent, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (budgetsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Ngân sách</h1>
          <p className="text-muted-foreground">Quản lý ngân sách chi tiêu theo danh mục</p>
        </div>
        <div className="flex gap-2">
          {!hasBudgets && hasCategories && (
            <Button variant="outline" onClick={loadSampleBudgets} disabled={loadingSample}>
              <Sparkles className="w-4 h-4 mr-2" />
              Tải mẫu
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tạo ngân sách
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBudget ? 'Chỉnh sửa ngân sách' : 'Tạo ngân sách mới'}</DialogTitle>
                <DialogDescription>
                  Đặt ngân sách cho danh mục chi tiêu để theo dõi và kiểm soát tốt hơn
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Danh mục chi tiêu</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Số tiền (VNĐ)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="5000000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Kỳ hạn</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value) => setFormData({ ...formData, period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kỳ hạn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Hàng tháng</SelectItem>
                      <SelectItem value="quarterly">Hàng quý</SelectItem>
                      <SelectItem value="yearly">Hàng năm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingBudget ? 'Cập nhật' : 'Tạo ngân sách'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sample data suggestion */}
      {!hasBudgets && hasCategories && (
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <strong>Mẹo:</strong> Bạn có thể tải {SAMPLE_BUDGET_TEMPLATES.length} mẫu ngân sách phổ biến 
            (Ăn uống, Di chuyển, Mua sắm...) để bắt đầu nhanh hơn! Nhấn nút <strong>"Tải mẫu"</strong> ở trên.
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng quan</CardTitle>
          <CardDescription>Tháng {currentMonth}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tổng ngân sách</p>
              <p className="text-2xl font-bold">{totalBudget.toLocaleString('vi-VN')} ₫</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã chi tiêu</p>
              <p className="text-2xl font-bold text-destructive">{totalSpent.toLocaleString('vi-VN')} ₫</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Còn lại</p>
              <p className="text-2xl font-bold text-green-600">{(totalBudget - totalSpent).toLocaleString('vi-VN')} ₫</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tiến độ</span>
              <span>{overallPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(overallPercentage, 100)} />
          </div>
        </CardContent>
      </Card>

      {/* Budget List */}
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Chưa có ngân sách nào</p>
            <p className="text-sm text-muted-foreground mb-4">Tạo ngân sách để theo dõi chi tiêu của bạn</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo ngân sách đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget: any) => {
            const category = categories.find((c: any) => c.id === budget.categoryId);
            const status = getBudgetStatus(budget.percentage);
            const StatusIcon = status.icon;

            return (
              <Card key={budget.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: category?.color + '20' }}>
                        <span className="text-lg">{category?.icon || '📊'}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category?.name || 'Unknown'}</CardTitle>
                        <CardDescription>{budget.month}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(budget)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(budget.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Đã chi</p>
                      <p className="text-xl font-bold">{budget.spent.toLocaleString('vi-VN')} ₫</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Ngân sách</p>
                      <p className="text-xl font-bold">{budget.amount.toLocaleString('vi-VN')} ₫</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Progress value={Math.min(budget.percentage, 100)} className="flex-1 mr-4" />
                      <Badge variant={status.color as any} className="flex items-center gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {budget.percentage.toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Còn lại: {budget.remaining.toLocaleString('vi-VN')} ₫
                    </p>
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