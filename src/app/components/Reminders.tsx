import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { remindersApi, categoriesApi, accountsApi } from '../../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Plus, Bell, BellOff, Clock, Calendar, DollarSign, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

export function Reminders() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'DAILY',
    frequency: 'DAILY',
    dayOfMonth: '',
    dayOfWeek: '',
    time: '21:00',
    amount: '',
    categoryId: '',
    accountId: '',
  });

  // Fetch reminders
  const { data: remindersData, isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => remindersApi.getAll(),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  // Fetch accounts
  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.getAll(),
  });

  const reminders = remindersData?.data || [];
  const categories = categoriesData?.data || [];
  const accounts = accountsData?.data || [];

  // Create reminder mutation
  const createMutation = useMutation({
    mutationFn: remindersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Nhắc nhở đã được tạo');
      setIsOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Không thể tạo nhắc nhở');
    },
  });

  // Update reminder mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => remindersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Nhắc nhở đã được cập nhật');
      setIsOpen(false);
      setEditingReminder(null);
      resetForm();
    },
    onError: () => {
      toast.error('Không thể cập nhật nhắc nhở');
    },
  });

  // Toggle reminder mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: any) => remindersApi.update(id, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Đã cập nhật trạng thái');
    },
    onError: () => {
      toast.error('Không thể cập nhật');
    },
  });

  // Delete reminder mutation
  const deleteMutation = useMutation({
    mutationFn: remindersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Nhắc nhở đã được xóa');
    },
    onError: () => {
      toast.error('Không thể xóa nhắc nhở');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'DAILY',
      frequency: 'DAILY',
      dayOfMonth: '',
      dayOfWeek: '',
      time: '21:00',
      amount: '',
      categoryId: '',
      accountId: '',
    });
    setEditingReminder(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const data = {
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : null,
      dayOfMonth: formData.dayOfMonth ? parseInt(formData.dayOfMonth) : null,
    };

    if (editingReminder) {
      updateMutation.mutate({
        id: editingReminder.id,
        data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (reminder: any) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      type: reminder.type,
      frequency: reminder.frequency || 'DAILY',
      dayOfMonth: reminder.dayOfMonth?.toString() || '',
      dayOfWeek: reminder.dayOfWeek || '',
      time: reminder.time || '21:00',
      amount: reminder.amount?.toString() || '',
      categoryId: reminder.categoryId || '',
      accountId: reminder.accountId || '',
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa nhắc nhở này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggle = (reminder: any) => {
    toggleMutation.mutate({
      id: reminder.id,
      enabled: !reminder.enabled,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BILL': return TrendingDown;
      case 'INCOME': return TrendingUp;
      default: return Bell;
    }
  };

  const getFrequencyText = (reminder: any) => {
    if (reminder.frequency === 'DAILY') return 'Hàng ngày';
    if (reminder.frequency === 'WEEKLY') return `Hàng tuần (${reminder.dayOfWeek})`;
    if (reminder.frequency === 'MONTHLY') return `Hàng tháng (ngày ${reminder.dayOfMonth})`;
    return 'Tùy chỉnh';
  };

  const dailyReminders = reminders.filter((r: any) => r.type === 'DAILY');
  const billReminders = reminders.filter((r: any) => r.type === 'BILL');
  const incomeReminders = reminders.filter((r: any) => r.type === 'INCOME');

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
          <h1 className="text-3xl font-bold">Nhắc nhở</h1>
          <p className="text-muted-foreground">Quản lý nhắc nhở thanh toán và ghi thu chi</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo nhắc nhở
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReminder ? 'Chỉnh sửa nhắc nhở' : 'Tạo nhắc nhở mới'}</DialogTitle>
              <DialogDescription>
                Thiết lập nhắc nhở tự động cho thu chi định kỳ
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  placeholder="Trả tiền điện, Nhận lương..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Loại nhắc nhở</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Ghi thu chi hàng ngày</SelectItem>
                    <SelectItem value="BILL">Thanh toán hóa đơn</SelectItem>
                    <SelectItem value="INCOME">Ghi thu nhập định kỳ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(formData.type === 'BILL' || formData.type === 'INCOME') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Tần suất</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tần suất" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Hàng ngày</SelectItem>
                        <SelectItem value="WEEKLY">Hàng tuần</SelectItem>
                        <SelectItem value="MONTHLY">Hàng tháng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.frequency === 'MONTHLY' && (
                    <div className="space-y-2">
                      <Label htmlFor="dayOfMonth">Ngày trong tháng</Label>
                      <Input
                        id="dayOfMonth"
                        type="number"
                        min="1"
                        max="31"
                        placeholder="1-31"
                        value={formData.dayOfMonth}
                        onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                      />
                    </div>
                  )}
                  {formData.frequency === 'WEEKLY' && (
                    <div className="space-y-2">
                      <Label htmlFor="dayOfWeek">Ngày trong tuần</Label>
                      <Select
                        value={formData.dayOfWeek}
                        onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn ngày" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monday">Thứ 2</SelectItem>
                          <SelectItem value="Tuesday">Thứ 3</SelectItem>
                          <SelectItem value="Wednesday">Thứ 4</SelectItem>
                          <SelectItem value="Thursday">Thứ 5</SelectItem>
                          <SelectItem value="Friday">Thứ 6</SelectItem>
                          <SelectItem value="Saturday">Thứ 7</SelectItem>
                          <SelectItem value="Sunday">Chủ nhật</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Số tiền (VNĐ)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="500000"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Danh mục</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountId">Tài khoản</Label>
                    <Select
                      value={formData.accountId}
                      onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tài khoản" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acc: any) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="time">Thời gian nhắc</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingReminder ? 'Cập nhật' : 'Tạo nhắc nhở'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Chưa có nhắc nhở nào</p>
            <p className="text-sm text-muted-foreground mb-4">Tạo nhắc nhở để không quên các khoản thu chi quan trọng</p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo nhắc nhở đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Daily Reminders */}
          {dailyReminders.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Nhắc nhở hàng ngày
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dailyReminders.map((reminder: any) => {
                  const TypeIcon = getTypeIcon(reminder.type);
                  return (
                    <Card key={reminder.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <TypeIcon className="w-5 h-5 text-primary" />
                            <div>
                              <CardTitle className="text-base">{reminder.title}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3" />
                                {reminder.time}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={reminder.enabled}
                              onCheckedChange={() => handleToggle(reminder)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(reminder)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(reminder.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bill Reminders */}
          {billReminders.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-destructive" />
                Thanh toán hóa đơn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {billReminders.map((reminder: any) => {
                  const category = categories.find((c: any) => c.id === reminder.categoryId);
                  return (
                    <Card key={reminder.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <CardTitle className="text-base">{reminder.title}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={reminder.enabled}
                                  onCheckedChange={() => handleToggle(reminder)}
                                />
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(reminder)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(reminder.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              {reminder.amount && (
                                <p className="text-sm font-medium text-destructive">
                                  {reminder.amount.toLocaleString('vi-VN')} ₫
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {getFrequencyText(reminder)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {reminder.time}
                                </span>
                              </div>
                              {category && (
                                <Badge variant="outline" className="text-xs">
                                  {category.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Income Reminders */}
          {incomeReminders.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Ghi thu nhập định kỳ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {incomeReminders.map((reminder: any) => {
                  const category = categories.find((c: any) => c.id === reminder.categoryId);
                  return (
                    <Card key={reminder.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <CardTitle className="text-base">{reminder.title}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={reminder.enabled}
                                  onCheckedChange={() => handleToggle(reminder)}
                                />
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(reminder)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(reminder.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              {reminder.amount && (
                                <p className="text-sm font-medium text-green-600">
                                  +{reminder.amount.toLocaleString('vi-VN')} ₫
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {getFrequencyText(reminder)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {reminder.time}
                                </span>
                              </div>
                              {category && (
                                <Badge variant="outline" className="text-xs">
                                  {category.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
