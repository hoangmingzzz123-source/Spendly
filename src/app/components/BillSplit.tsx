import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../../lib/store';
import { apiRequest } from '../../lib/supabase';
import { formatCurrency } from '../../lib/currency';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Receipt,
  Plus,
  Trash2,
  Users,
  UtensilsCrossed,
  Calculator,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Loader2,
  X,
  Calendar,
  Lock,
  Ban,
  ArrowLeftRight,
} from 'lucide-react';
import { toast } from 'sonner';

const fmt = (n: number) => Math.round(n).toLocaleString('vi-VN');

interface Bill {
  id: string;
  name: string;
  date: string;
  status: 'PENDING' | 'COMPLETED';
  participants: { id: string; name: string }[];
  items: { id: string; name: string; price: number; shares: string[] }[];
  payments: { id: string; participantId: string; amount: number }[];
  settlements: { id: string; fromParticipantId: string; toParticipantId: string; amount: number }[];
  transactions: { id: string; fromParticipantId: string; toParticipantId: string; amount: number; note: string; paymentDate: string }[];
  owes?: Record<string, number>;
  balances?: Record<string, number>;
  totalAmount: number;
  createdAt: string;
}

type Step = 'participants' | 'items' | 'shares' | 'payer' | 'split' | 'track';

export function BillSplit() {
  const { accessToken } = useStore();
  const queryClient = useQueryClient();
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBillName, setNewBillName] = useState('');
  const [newBillDate, setNewBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentStep, setCurrentStep] = useState<Step>('participants');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<{ fromId: string; toId: string; maxAmount: number } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Queries
  const { data: billsData, isLoading: billsLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: () => apiRequest('/bills'),
    enabled: !!accessToken,
  });

  const bills: Bill[] = billsData?.data || [];

  const { data: billDetailData, isLoading: billLoading } = useQuery({
    queryKey: ['bill', selectedBillId],
    queryFn: () => apiRequest(`/bills/${selectedBillId}`),
    enabled: !!accessToken && !!selectedBillId,
  });

  const bill: Bill | null = billDetailData?.data || null;

  // Mutations
  const createBill = useMutation({
    mutationFn: (data: { name: string; date: string }) => apiRequest('/bills', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setSelectedBillId(res.data.id);
      setShowCreateDialog(false);
      setNewBillName('');
      setCurrentStep('participants');
      toast.success('Tạo bill thành công!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteBill = useMutation({
    mutationFn: (id: string) => apiRequest(`/bills/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setSelectedBillId(null);
      toast.success('Xóa bill thành công!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const addParticipant = useMutation({
    mutationFn: ({ billId, name }: { billId: string; name: string }) =>
      apiRequest(`/bills/${billId}/participants`, { method: 'POST', body: JSON.stringify({ name }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', selectedBillId] });
      setNewParticipantName('');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeParticipant = useMutation({
    mutationFn: ({ billId, pid }: { billId: string; pid: string }) =>
      apiRequest(`/bills/${billId}/participants/${pid}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bill', selectedBillId] }),
    onError: (e: any) => toast.error(e.message),
  });

  const addItem = useMutation({
    mutationFn: ({ billId, name, price }: { billId: string; name: string; price: number }) =>
      apiRequest(`/bills/${billId}/items`, { method: 'POST', body: JSON.stringify({ name, price }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', selectedBillId] });
      setNewItemName('');
      setNewItemPrice('');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeItem = useMutation({
    mutationFn: ({ billId, itemId }: { billId: string; itemId: string }) =>
      apiRequest(`/bills/${billId}/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bill', selectedBillId] }),
    onError: (e: any) => toast.error(e.message),
  });

  const updateShares = useMutation({
    mutationFn: ({ billId, itemId, participantIds }: { billId: string; itemId: string; participantIds: string[] }) =>
      apiRequest(`/bills/${billId}/items/${itemId}/shares`, { method: 'POST', body: JSON.stringify({ participantIds }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bill', selectedBillId] }),
    onError: (e: any) => toast.error(e.message),
  });

  const setPayments = useMutation({
    mutationFn: ({ billId, payments }: { billId: string; payments: { participantId: string; amount: number }[] }) =>
      apiRequest(`/bills/${billId}/payments`, { method: 'POST', body: JSON.stringify({ payments }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bill', selectedBillId] }),
    onError: (e: any) => toast.error(e.message),
  });

  const splitBill = useMutation({
    mutationFn: (billId: string) => apiRequest(`/bills/${billId}/split`, { method: 'POST' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bill', selectedBillId] });
      await queryClient.refetchQueries({ queryKey: ['bill', selectedBillId] });
      toast.success('Chia bill thành công!');
      setCurrentStep('track');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const addTransaction = useMutation({
    mutationFn: ({ billId, ...data }: { billId: string; fromParticipantId: string; toParticipantId: string; amount: number; note: string }) =>
      apiRequest(`/bills/${billId}/transactions`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', selectedBillId] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setShowPaymentDialog(false);
      setPaymentAmount('');
      setPaymentNote('');
      toast.success('Ghi nhận thanh toán!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const completeBill = useMutation({
    mutationFn: (billId: string) => apiRequest(`/bills/${billId}/complete`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', selectedBillId] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Bill đã hoàn thành!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Payer state
  const [payerAmounts, setPayerAmounts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (bill) {
      const amounts: Record<string, string> = {};
      bill.payments.forEach(p => { amounts[p.participantId] = p.amount.toString(); });
      setPayerAmounts(amounts);
    }
  }, [bill?.payments]);

  const filteredBills = useMemo(() => {
    if (!dateFilter) return bills;
    return bills.filter(b => b.date.startsWith(dateFilter));
  }, [bills, dateFilter]);

  const participantName = (id: string) => bill?.participants.find(p => p.id === id)?.name || 'Unknown';

  const getSettlementStatus = (settlement: any) => {
    if (!bill) return { paid: 0, remaining: settlement.amount, status: 'UNPAID' as const };
    const paid = (bill.transactions || [])
      .filter(t => t.fromParticipantId === settlement.fromParticipantId && t.toParticipantId === settlement.toParticipantId)
      .reduce((s, t) => s + t.amount, 0);
    const remaining = Math.max(0, settlement.amount - paid);
    const status = remaining <= 0.01 ? 'DONE' : paid > 0 ? 'PARTIAL' : 'UNPAID';
    return { paid, remaining, status };
  };

  const overallProgress = useMemo(() => {
    if (!bill?.settlements?.length) return 0;
    const totalDebt = bill.settlements.reduce((s, st) => s + st.amount, 0);
    const totalPaid = (bill.transactions || []).reduce((s, t) => s + t.amount, 0);
    return totalDebt > 0 ? Math.min(100, (totalPaid / totalDebt) * 100) : 0;
  }, [bill?.settlements, bill?.transactions]);

  // Steps definition
  const steps: { key: Step; label: string; icon: any }[] = [
    { key: 'participants', label: 'Người', icon: Users },
    { key: 'items', label: 'Món', icon: UtensilsCrossed },
    { key: 'shares', label: 'Gán', icon: ArrowLeftRight },
    { key: 'payer', label: 'Trả', icon: CreditCard },
    { key: 'split', label: 'Chia', icon: Calculator },
    { key: 'track', label: 'Theo dõi', icon: CheckCircle2 },
  ];

  // ===== BILL LIST VIEW =====
  if (!selectedBillId) {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-7 h-7 text-indigo-500" />
              Chia bill
            </h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý và chia bill nhóm</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-1" /> Tạo bill
          </Button>
        </div>

        {/* Date filter */}
        <div className="mb-4">
          <Input
            type="month"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            placeholder="Lọc theo tháng"
            className="w-48"
          />
          {dateFilter && (
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setDateFilter('')}>
              <X className="w-3 h-3 mr-1" /> Xóa lọc
            </Button>
          )}
        </div>

        {billsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-20">
            <Receipt className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500">Chưa có bill nào</p>
            <Button onClick={() => setShowCreateDialog(true)} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-1" /> Tạo bill đầu tiên
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredBills.map(b => (
              <Card
                key={b.id}
                className="cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 transition-all hover:shadow-md"
                onClick={() => {
                  setSelectedBillId(b.id);
                  setCurrentStep(b.settlements?.length ? 'track' : 'participants');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{b.name}</h3>
                        <Badge variant={b.status === 'COMPLETED' ? 'default' : 'secondary'} className={b.status === 'COMPLETED' ? 'bg-emerald-500' : ''}>
                          {b.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang xử lý'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{b.date}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{b.participants?.length || 0} người</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{fmt(b.totalAmount)}đ</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo bill mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Tên bill</label>
                <Input value={newBillName} onChange={e => setNewBillName(e.target.value)} placeholder="VD: Ăn lẩu nhóm..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ngày</label>
                <Input type="date" value={newBillDate} onChange={e => setNewBillDate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Hủy</Button>
              <Button
                disabled={!newBillName.trim() || createBill.isPending}
                onClick={() => createBill.mutate({ name: newBillName.trim(), date: newBillDate })}
              >
                {createBill.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                Tạo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ===== BILL DETAIL VIEW =====
  if (billLoading || !bill) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const isCompleted = bill.status === 'COMPLETED';

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedBillId(null)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{bill.name}</h1>
            {isCompleted && <Badge className="bg-emerald-500"><Lock className="w-3 h-3 mr-1" />Hoàn thành</Badge>}
          </div>
          <p className="text-sm text-gray-500">{bill.date} &middot; {fmt(bill.totalAmount)}đ &middot; {bill.participants.length} người</p>
        </div>
        {!isCompleted && (
          <Button variant="destructive" size="sm" onClick={() => {
            if (confirm('Xóa bill này?')) deleteBill.mutate(bill.id);
          }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Progress bar for payment tracking */}
      {bill.settlements?.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Tiến độ thanh toán</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      )}

      {/* Step navigation */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = currentStep === step.key;
          return (
            <button
              key={step.key}
              onClick={() => setCurrentStep(step.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Step content */}
      {currentStep === 'participants' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-indigo-500" /> Người tham gia ({bill.participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isCompleted && (
              <form
                className="flex gap-2"
                onSubmit={e => {
                  e.preventDefault();
                  if (newParticipantName.trim()) {
                    addParticipant.mutate({ billId: bill.id, name: newParticipantName.trim() });
                  }
                }}
              >
                <Input
                  value={newParticipantName}
                  onChange={e => setNewParticipantName(e.target.value)}
                  placeholder="Tên người..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newParticipantName.trim() || addParticipant.isPending} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </form>
            )}
            {bill.participants.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Thêm người tham gia</p>
            ) : (
              <div className="divide-y dark:divide-gray-800">
                {bill.participants.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-sm font-bold text-indigo-600">
                        {p.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{p.name}</span>
                    </div>
                    {!isCompleted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeParticipant.mutate({ billId: bill.id, pid: p.id })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {bill.participants.length >= 2 && !isCompleted && (
              <Button variant="outline" className="w-full" onClick={() => setCurrentStep('items')}>
                Tiếp: Nhập món <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 'items' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" /> Món ăn ({bill.items.length}) &middot; Tổng: {fmt(bill.totalAmount)}đ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isCompleted && (
              <form
                className="flex gap-2"
                onSubmit={e => {
                  e.preventDefault();
                  if (newItemName.trim() && newItemPrice) {
                    addItem.mutate({ billId: bill.id, name: newItemName.trim(), price: parseFloat(newItemPrice) });
                  }
                }}
              >
                <Input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Tên món" className="flex-1" />
                <Input value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="Giá" type="number" className="w-28" />
                <Button type="submit" size="sm" disabled={!newItemName.trim() || !newItemPrice || addItem.isPending}>
                  <Plus className="w-4 h-4" />
                </Button>
              </form>
            )}
            {bill.items.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Thêm món ăn</p>
            ) : (
              <div className="divide-y dark:divide-gray-800">
                {bill.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="font-medium text-sm">{item.name}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {item.shares?.length > 0 && `(${item.shares.length} người)`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">{fmt(item.price)}đ</span>
                      {!isCompleted && (
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-7 w-7 p-0" onClick={() => removeItem.mutate({ billId: bill.id, itemId: item.id })}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {bill.items.length > 0 && !isCompleted && (
              <Button variant="outline" className="w-full" onClick={() => setCurrentStep('shares')}>
                Tiếp: Gán món <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 'shares' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowLeftRight className="w-5 h-5 text-purple-500" /> Gán món cho người
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bill.items.length === 0 || bill.participants.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Cần có ít nhất 1 món và 1 người tham gia</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-2 pr-2 font-medium text-gray-500">Món</th>
                      <th className="text-right py-2 pr-3 font-medium text-gray-500">Giá</th>
                      {bill.participants.map(p => (
                        <th key={p.id} className="text-center py-2 px-1 font-medium text-gray-500 min-w-[50px]">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-xs font-bold text-indigo-600 mx-auto" title={p.name}>
                            {p.name[0].toUpperCase()}
                          </div>
                          <span className="text-[10px] block mt-0.5 truncate max-w-[50px]">{p.name}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map(item => (
                      <tr key={item.id} className="border-b dark:border-gray-800">
                        <td className="py-2.5 pr-2 font-medium">{item.name}</td>
                        <td className="py-2.5 pr-3 text-right text-indigo-600 dark:text-indigo-400 font-medium">{fmt(item.price)}đ</td>
                        {bill.participants.map(p => {
                          const checked = (item.shares || []).includes(p.id);
                          return (
                            <td key={p.id} className="py-2.5 text-center">
                              <Checkbox
                                checked={checked}
                                disabled={isCompleted}
                                onCheckedChange={(val) => {
                                  const newShares = val
                                    ? [...(item.shares || []), p.id]
                                    : (item.shares || []).filter(s => s !== p.id);
                                  updateShares.mutate({ billId: bill.id, itemId: item.id, participantIds: newShares });
                                }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Per-person summary */}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-2">Tổng mỗi người (dự kiến)</p>
                  <div className="flex flex-wrap gap-2">
                    {bill.participants.map(p => {
                      const total = bill.items.reduce((sum, item) => {
                        if ((item.shares || []).includes(p.id)) {
                          return sum + item.price / (item.shares.length || 1);
                        }
                        return sum;
                      }, 0);
                      return (
                        <Badge key={p.id} variant="secondary" className="text-xs">
                          {p.name}: {fmt(total)}đ
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {!isCompleted && (
              <Button variant="outline" className="w-full mt-4" onClick={() => setCurrentStep('payer')}>
                Tiếp: Chọn người trả <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 'payer' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="w-5 h-5 text-green-500" /> Ai đã trả bill?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-500">Nhập số tiền mỗi người đã trả (tổng phải bằng {fmt(bill.totalAmount)}đ)</p>
            {bill.participants.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-28">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                    {p.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium truncate">{p.name}</span>
                </div>
                <Input
                  type="number"
                  value={payerAmounts[p.id] || ''}
                  onChange={e => setPayerAmounts({ ...payerAmounts, [p.id]: e.target.value })}
                  placeholder="0"
                  disabled={isCompleted}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-6">đ</span>
              </div>
            ))}
            {(() => {
              const totalPayer = Object.values(payerAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
              const diff = totalPayer - bill.totalAmount;
              return (
                <div className={`text-xs p-2 rounded-lg ${Math.abs(diff) < 0.01 ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'}`}>
                  Tổng đã trả: {fmt(totalPayer)}đ / {fmt(bill.totalAmount)}đ
                  {Math.abs(diff) > 0.01 && ` (${diff > 0 ? 'thừa' : 'thiếu'} ${fmt(Math.abs(diff))}đ)`}
                </div>
              );
            })()}
            {!isCompleted && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // Quick: 1 person pays all
                    if (bill.participants.length > 0) {
                      const firstId = bill.participants[0].id;
                      const amounts: Record<string, string> = {};
                      bill.participants.forEach(p => { amounts[p.id] = p.id === firstId ? bill.totalAmount.toString() : '0'; });
                      setPayerAmounts(amounts);
                    }
                  }}
                >
                  {bill.participants[0]?.name} trả hết
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    const payments = bill.participants
                      .filter(p => parseFloat(payerAmounts[p.id] || '0') > 0)
                      .map(p => ({ participantId: p.id, amount: parseFloat(payerAmounts[p.id] || '0') }));
                    setPayments.mutate({ billId: bill.id, payments });
                  }}
                  disabled={setPayments.isPending}
                >
                  Lưu
                </Button>
              </div>
            )}
            {bill.payments?.length > 0 && !isCompleted && (
              <Button variant="outline" className="w-full" onClick={() => setCurrentStep('split')}>
                Tiếp: Chia bill <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 'split' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="w-5 h-5 text-blue-500" /> Chia bill
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isCompleted && (
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => splitBill.mutate(bill.id)}
                disabled={splitBill.isPending || bill.items.length === 0 || bill.payments.length === 0}
              >
                {splitBill.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Calculator className="w-4 h-4 mr-1" />}
                Tính toán chia bill
              </Button>
            )}

            {bill.owes && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tổng tiền mỗi người phải trả</h3>
                {bill.participants.map(p => (
                  <div key={p.id} className="flex justify-between items-center py-1.5 text-sm">
                    <span>{p.name}</span>
                    <span className="font-semibold">{fmt(bill.owes![p.id] || 0)}đ</span>
                  </div>
                ))}
              </div>
            )}

            {bill.settlements?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ai trả cho ai</h3>
                {bill.settlements.map(s => (
                  <div key={s.id} className="flex items-center gap-2 py-2 px-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
                    <span className="font-medium">{participantName(s.fromParticipantId)}</span>
                    <ArrowRight className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">{participantName(s.toParticipantId)}</span>
                    <span className="ml-auto font-bold text-amber-700 dark:text-amber-400">{fmt(s.amount)}đ</span>
                  </div>
                ))}
              </div>
            )}

            {bill.settlements?.length > 0 && (
              <Button variant="outline" className="w-full" onClick={() => setCurrentStep('track')}>
                Tiếp: Theo dõi thanh toán <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 'track' && (
        <div className="space-y-4">
          {/* Settlement tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Theo dõi thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!bill.settlements?.length ? (
                <div className="text-center py-6">
                  <Ban className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Chưa chia bill. Hãy hoàn thành các bước trước.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bill.settlements.map(s => {
                    const { paid, remaining, status } = getSettlementStatus(s);
                    const progress = s.amount > 0 ? (paid / s.amount) * 100 : 0;
                    return (
                      <div key={s.id} className="p-3 rounded-lg border dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{participantName(s.fromParticipantId)}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-medium">{participantName(s.toParticipantId)}</span>
                          </div>
                          <Badge
                            variant={status === 'DONE' ? 'default' : 'secondary'}
                            className={status === 'DONE' ? 'bg-emerald-500' : status === 'PARTIAL' ? 'bg-amber-500 text-white' : ''}
                          >
                            {status === 'DONE' ? 'Đã trả' : status === 'PARTIAL' ? 'Trả một phần' : 'Chưa trả'}
                          </Badge>
                        </div>
                        <Progress value={progress} className="h-1.5 mb-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Đã trả: {fmt(paid)}đ / {fmt(s.amount)}đ</span>
                          {remaining > 0 && <span className="text-red-500">Còn nợ: {fmt(remaining)}đ</span>}
                        </div>
                        {remaining > 0 && !isCompleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 text-xs"
                            onClick={() => {
                              setPaymentTarget({
                                fromId: s.fromParticipantId,
                                toId: s.toParticipantId,
                                maxAmount: remaining,
                              });
                              setPaymentAmount(remaining.toString());
                              setShowPaymentDialog(true);
                            }}
                          >
                            <CreditCard className="w-3.5 h-3.5 mr-1" /> Ghi nhận thanh toán
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction history */}
          {bill.transactions?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lịch sử thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y dark:divide-gray-800">
                  {bill.transactions.map(t => (
                    <div key={t.id} className="py-2.5 flex items-center justify-between text-sm">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{participantName(t.fromParticipantId)}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className="font-medium">{participantName(t.toParticipantId)}</span>
                        </div>
                        <div className="text-xs text-gray-400">{t.paymentDate}{t.note && ` · ${t.note}`}</div>
                      </div>
                      <span className="font-bold text-emerald-600">{fmt(t.amount)}đ</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complete button */}
          {!isCompleted && bill.settlements?.length > 0 && (
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                if (confirm('Hoàn thành bill? Sau khi hoàn thành sẽ không thể chỉnh sửa.')) {
                  completeBill.mutate(bill.id);
                }
              }}
              disabled={completeBill.isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" /> Hoàn thành bill
            </Button>
          )}
        </div>
      )}

      {/* Payment dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ghi nhận thanh toán</DialogTitle>
          </DialogHeader>
          {paymentTarget && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="font-semibold">{participantName(paymentTarget.fromId)}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">{participantName(paymentTarget.toId)}</span>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Số tiền (tối đa {fmt(paymentTarget.maxAmount)}đ)</label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  max={paymentTarget.maxAmount}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ghi chú</label>
                <Input value={paymentNote} onChange={e => setPaymentNote(e.target.value)} placeholder="VD: Chuyển khoản..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Hủy</Button>
            <Button
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || addTransaction.isPending}
              onClick={() => {
                if (paymentTarget) {
                  addTransaction.mutate({
                    billId: bill.id,
                    fromParticipantId: paymentTarget.fromId,
                    toParticipantId: paymentTarget.toId,
                    amount: parseFloat(paymentAmount),
                    note: paymentNote,
                  });
                }
              }}
            >
              {addTransaction.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}