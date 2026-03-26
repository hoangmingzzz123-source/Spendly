import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsApi } from '../../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Plus, Target, PiggyBank, TrendingUp, Calendar, Edit2, Trash2, DollarSign } from 'lucide-react';

export function Goals() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [allocateAmount, setAllocateAmount] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    icon: '🎯',
    color: '#3B82F6',
  });

  // Fetch goals
  const { data: goalsData, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.getAll(),
  });

  const goals = goalsData?.data || [];

  // Create goal mutation
  const createMutation = useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Mục tiêu đã được tạo');
      setIsOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Không thể tạo mục tiêu');
    },
  });

  // Update goal mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => goalsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Mục tiêu đã được cập nhật');
      setIsOpen(false);
      setEditingGoal(null);
      resetForm();
    },
    onError: () => {
      toast.error('Không thể cập nhật mục tiêu');
    },
  });

  // Allocate mutation
  const allocateMutation = useMutation({
    mutationFn: ({ id, amount }: any) => goalsApi.allocate(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Đã cộng tiền vào mục tiêu');
      setAllocateDialogOpen(false);
      setAllocateAmount('');
      setSelectedGoal(null);
    },
    onError: () => {
      toast.error('Không thể cộng tiền');
    },
  });

  // Delete goal mutation
  const deleteMutation = useMutation({
    mutationFn: goalsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Mục tiêu đã được xóa');
    },
    onError: () => {
      toast.error('Không thể xóa mục tiêu');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      deadline: '',
      icon: '🎯',
      color: '#3B82F6',
    });
    setEditingGoal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (editingGoal) {
      updateMutation.mutate({
        id: editingGoal.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      deadline: goal.deadline || '',
      icon: goal.icon || '🎯',
      color: goal.color || '#3B82F6',
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa mục tiêu này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAllocate = (goal: any) => {
    setSelectedGoal(goal);
    setAllocateDialogOpen(true);
  };

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allocateAmount || parseFloat(allocateAmount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    allocateMutation.mutate({
      id: selectedGoal.id,
      amount: parseFloat(allocateAmount),
    });
  };

  const iconOptions = ['🎯', '🏠', '🚗', '✈️', '💍', '🎓', '💰', '🏖️', '📱', '🎮'];
  const colorOptions = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const totalTarget = goals.reduce((sum: number, g: any) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum: number, g: any) => sum + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  if (isLoading) {
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
          <h1 className="text-3xl font-bold">Mục tiêu tiết kiệm</h1>
          <p className="text-muted-foreground">Đặt và theo dõi mục tiêu tài chính của bạn</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo mục tiêu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Chỉnh sửa mục tiêu' : 'Tạo mục tiêu mới'}</DialogTitle>
              <DialogDescription>
                Đặt mục tiêu tiết kiệm và theo dõi tiến độ
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên mục tiêu</Label>
                <Input
                  id="name"
                  placeholder="Mua nhà, Du lịch..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Số tiền mục tiêu (VNĐ)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="100000000"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Thời hạn (tùy chọn)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex gap-2 flex-wrap">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`w-10 h-10 text-xl rounded border-2 ${formData.icon === icon ? 'border-primary' : 'border-border'}`}
                      onClick={() => setFormData({ ...formData, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Màu sắc</Label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-10 h-10 rounded border-2 ${formData.color === color ? 'border-primary' : 'border-border'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingGoal ? 'Cập nhật' : 'Tạo mục tiêu'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Tổng quan tiết kiệm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tổng mục tiêu</p>
              <p className="text-2xl font-bold">{totalTarget.toLocaleString('vi-VN')} ₫</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã tiết kiệm</p>
              <p className="text-2xl font-bold text-green-600">{totalSaved.toLocaleString('vi-VN')} ₫</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Còn lại</p>
              <p className="text-2xl font-bold">{(totalTarget - totalSaved).toLocaleString('vi-VN')} ₫</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tiến độ tổng</span>
              <span>{overallProgress.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(overallProgress, 100)} />
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Chưa có mục tiêu nào</p>
            <p className="text-sm text-muted-foreground mb-4">Tạo mục tiêu tiết kiệm để bắt đầu</p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo mục tiêu đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal: any) => (
            <Card key={goal.id} className="relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 right-0 h-1" 
                style={{ backgroundColor: goal.color }}
              />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: goal.color + '20' }}
                    >
                      {goal.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                      {goal.deadline && (
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(goal.deadline).toLocaleDateString('vi-VN')}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tiến độ</span>
                    <span className="font-medium">{goal.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(goal.progress, 100)} />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Đã tiết kiệm</p>
                    <p className="text-lg font-bold text-green-600">
                      {goal.currentAmount.toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Mục tiêu</p>
                    <p className="text-lg font-bold">
                      {goal.targetAmount.toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Còn lại: {goal.remaining.toLocaleString('vi-VN')} ₫
                  </p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleAllocate(goal)}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Cộng tiền
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Allocate Dialog */}
      <Dialog open={allocateDialogOpen} onOpenChange={setAllocateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cộng tiền vào mục tiêu</DialogTitle>
            <DialogDescription>
              {selectedGoal?.name} - Còn lại: {selectedGoal?.remaining?.toLocaleString('vi-VN')} ₫
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAllocateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allocateAmount">Số tiền cộng vào (VNĐ)</Label>
              <Input
                id="allocateAmount"
                type="number"
                placeholder="1000000"
                value={allocateAmount}
                onChange={(e) => setAllocateAmount(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={allocateMutation.isPending}>
              Xác nhận
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
