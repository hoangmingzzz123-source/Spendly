import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Plus, Wallet, CreditCard, Landmark, Loader2, Search, Smartphone, Briefcase, Trash2, Edit2, X } from 'lucide-react';
import { Badge } from './ui/badge';

// Vietnamese bank/ewallet data with brand colors
const BANK_LOGOS = [
  { code: 'tcb', name: 'Techcombank', color: '#ED1C24', initials: 'TCB' },
  { code: 'vcb', name: 'Vietcombank', color: '#00653E', initials: 'VCB' },
  { code: 'bidv', name: 'BIDV', color: '#003399', initials: 'BIDV' },
  { code: 'vtin', name: 'Vietinbank', color: '#00447C', initials: 'VTB' },
  { code: 'mb', name: 'MB Bank', color: '#004A8F', initials: 'MB' },
  { code: 'acb', name: 'ACB', color: '#1B3A6B', initials: 'ACB' },
  { code: 'tpb', name: 'TPBank', color: '#5C2D91', initials: 'TPB' },
  { code: 'vpb', name: 'VPBank', color: '#00A650', initials: 'VPB' },
  { code: 'scb', name: 'Sacombank', color: '#0072BC', initials: 'SCB' },
  { code: 'shb', name: 'SHB', color: '#0057A8', initials: 'SHB' },
  { code: 'hdbank', name: 'HDBank', color: '#E31837', initials: 'HDB' },
  { code: 'ocb', name: 'OCB', color: '#008C3E', initials: 'OCB' },
  { code: 'msb', name: 'MSB', color: '#0072CE', initials: 'MSB' },
  { code: 'eib', name: 'Eximbank', color: '#0072BC', initials: 'EIB' },
  { code: 'abb', name: 'ABBank', color: '#E31837', initials: 'ABB' },
];

const EWALLET_LOGOS = [
  { code: 'momo', name: 'MoMo', color: '#AE2070', initials: 'MM' },
  { code: 'zalopay', name: 'ZaloPay', color: '#0068FF', initials: 'ZP' },
  { code: 'vnpay', name: 'VNPay', color: '#003087', initials: 'VN' },
  { code: 'shopeepay', name: 'ShopeePay', color: '#EE4D2D', initials: 'SP' },
  { code: 'viettelpay', name: 'ViettelPay', color: '#E60012', initials: 'VT' },
  { code: 'grab', name: 'GrabPay', color: '#00B14F', initials: 'GR' },
];

const ACCOUNT_TYPES = [
  { value: 'CASH', label: 'Tiền mặt', icon: Wallet, emoji: '💵' },
  { value: 'BANK', label: 'Ngân hàng', icon: Landmark, emoji: '🏦' },
  { value: 'EWALLET', label: 'Ví điện tử', icon: Smartphone, emoji: '📱' },
  { value: 'INCOME_SOURCE', label: 'Nguồn thu', icon: Briefcase, emoji: '💼' },
  { value: 'CREDIT', label: 'Thẻ tín dụng', icon: CreditCard, emoji: '💳' },
];

const COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#14B8A6',
];

export function Accounts() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [bankSearch, setBankSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'CASH',
    balance: '0',
    color: '#3B82F6',
    bankCode: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: accountsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Tạo tài khoản thành công!');
      closeDialog();
    },
    onError: (error: any) => toast.error(error.message || 'Có lỗi xảy ra'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => accountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Cập nhật thành công!');
      closeDialog();
    },
    onError: (error: any) => toast.error(error.message || 'Có lỗi xảy ra'),
  });

  const deleteMutation = useMutation({
    mutationFn: accountsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Đã xóa tài khoản');
      setDeleteConfirm(null);
    },
    onError: (error: any) => toast.error(error.message || 'Có lỗi xảy ra'),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAccount(null);
    setFormData({ name: '', type: 'CASH', balance: '0', color: '#3B82F6', bankCode: '' });
    setBankSearch('');
  };

  const openEdit = (account: any) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: String(account.balance || 0),
      color: account.color || '#3B82F6',
      bankCode: account.bankCode || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      balance: parseFloat(formData.balance) || 0,
    };

    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const selectBank = (bank: typeof BANK_LOGOS[0]) => {
    setFormData({ ...formData, name: bank.name, bankCode: bank.code, color: bank.color });
  };

  const selectEwallet = (ew: typeof EWALLET_LOGOS[0]) => {
    setFormData({ ...formData, name: ew.name, bankCode: ew.code, color: ew.color });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const accounts = data?.data || [];
  const totalBalance = accounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0);

  // Group accounts by type
  const grouped: Record<string, any[]> = {};
  accounts.forEach((acc: any) => {
    const type = acc.type || 'CASH';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(acc);
  });

  const filteredBanks = BANK_LOGOS.filter(b =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
    b.code.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const filteredEwallets = EWALLET_LOGOS.filter(e =>
    e.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
    e.code.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const getBankInfo = (code: string) =>
    BANK_LOGOS.find(b => b.code === code) || EWALLET_LOGOS.find(e => e.code === code);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Tài khoản & Nguồn tiền
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý ngân hàng, ví điện tử, tiền mặt & nguồn thu nhập
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm nguồn tiền
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Chỉnh sửa tài khoản' : 'Thêm nguồn tiền mới'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Type */}
              <div className="space-y-2">
                <Label>Loại tài khoản *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ACCOUNT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value, bankCode: '' })}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                        formData.type === type.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 ring-1 ring-blue-500'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{type.emoji}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank/Ewallet Logo Picker */}
              {(formData.type === 'BANK' || formData.type === 'EWALLET') && (
                <div className="space-y-2">
                  <Label>{formData.type === 'BANK' ? 'Chọn ngân hàng' : 'Chọn ví điện tử'}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      placeholder={formData.type === 'BANK' ? 'Tìm ngân hàng...' : 'Tìm ví...'}
                      className="pl-9"
                    />
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {(formData.type === 'BANK' ? filteredBanks : filteredEwallets).map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => formData.type === 'BANK' ? selectBank(item) : selectEwallet(item)}
                        className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                          formData.bankCode === item.code
                            ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold mb-1"
                          style={{ backgroundColor: item.color }}
                        >
                          {item.initials}
                        </div>
                        <span className="text-[10px] text-center leading-tight font-medium text-gray-700 dark:text-gray-300">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Tên tài khoản *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={
                    formData.type === 'INCOME_SOURCE' ? 'VD: Lương công ty, Freelance...'
                    : formData.type === 'CASH' ? 'VD: Ví tiền mặt'
                    : 'VD: Tài khoản chính'
                  }
                  required
                />
              </div>

              {/* Initial Balance */}
              <div className="space-y-2">
                <Label htmlFor="balance">
                  {formData.type === 'INCOME_SOURCE' ? 'Số tiền dự kiến/tháng' : 'Số dư ban đầu'}
                </Label>
                <Input
                  id="balance"
                  type="number"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0"
                />
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <Label>Màu sắc</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        formData.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang lưu...</>
                  ) : (
                    editingAccount ? 'Cập nhật' : 'Tạo tài khoản'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Balance Card */}
      <Card className="mb-6 bg-gradient-to-br from-blue-600 to-emerald-500 text-white border-0 shadow-lg">
        <CardContent className="pt-6 pb-6">
          <p className="text-sm opacity-90 mb-1">Tổng tài sản</p>
          <p className="text-3xl lg:text-4xl font-bold tracking-tight">{formatCurrency(totalBalance)}</p>
          <div className="flex gap-4 mt-3 text-sm opacity-90">
            <span>{accounts.length} tài khoản</span>
            <span>|</span>
            <span>{Object.keys(grouped).length} loại</span>
          </div>
        </CardContent>
      </Card>

      {/* Accounts by Type */}
      {ACCOUNT_TYPES.map((type) => {
        const typeAccounts = grouped[type.value] || [];
        if (typeAccounts.length === 0) return null;

        return (
          <div key={type.value} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{type.emoji}</span>
              <h2 className="font-semibold text-gray-800 dark:text-gray-200">{type.label}</h2>
              <Badge variant="secondary" className="text-xs">{typeAccounts.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeAccounts.map((account: any) => {
                const bankInfo = getBankInfo(account.bankCode);
                const TypeIcon = ACCOUNT_TYPES.find(t => t.value === account.type)?.icon || Wallet;

                return (
                  <Card key={account.id} className="hover:shadow-lg transition-all group relative">
                    {/* Actions */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(account)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500 hover:text-red-700"
                        onClick={() => setDeleteConfirm(account.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm"
                          style={{ backgroundColor: account.color || bankInfo?.color || '#3B82F6' }}
                        >
                          {bankInfo ? bankInfo.initials : <TypeIcon className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {account.name}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {ACCOUNT_TYPES.find(t => t.value === account.type)?.label}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-2xl font-bold ${
                        account.balance >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(account.balance || 0)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {accounts.length === 0 && (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              Bạn chưa có tài khoản nào. Hãy thêm nguồn tiền đầu tiên!
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm nguồn tiền
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bạn có chắc chắn muốn xóa tài khoản này? Hành động không thể hoàn tác.
          </p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Hủy</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
