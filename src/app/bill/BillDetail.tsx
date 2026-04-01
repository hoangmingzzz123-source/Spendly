import React from 'react';
import { Bill } from './types';
import { ParticipantList } from './ParticipantList';
import { ItemList } from './ItemList';
import { ShareTable } from './ShareTable';
import { PaymentTable } from './PaymentTable';
import { SettlementTable } from './SettlementTable';
import { TransactionTable } from './TransactionTable';
import { billSupabaseApi } from './supabaseApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';

// Helper: Tính tổng tiền mỗi người dựa trên shares
function calculateTotals(participants, items, shares) {
  const totals = {};
  participants.forEach(p => { totals[p.id] = 0; });
  items.forEach(item => {
    const itemShares = shares.filter(s => s.itemId === item.id);
    if (itemShares.length === 0) return;
    const shareAmount = item.price / itemShares.length;
    itemShares.forEach(s => { totals[s.participantId] += shareAmount; });
  });
  return totals;
}

// Helper: Tính settlement (ai trả cho ai)
function calculateSettlements(participants, totals, payments) {
  const balances = participants.map(p => ({
    id: p.id,
    name: p.name,
    total: totals[p.id] || 0,
    paid: payments.find(pay => pay.participantId === p.id)?.amountPaid || 0,
    balance: 0,
  }));
  balances.forEach(b => { b.balance = b.paid - b.total; });
  // Người dư (balance > 0) nhận, người thiếu (balance < 0) trả
  const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
  const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
  const settlements = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.balance, creditor.balance);
    if (amount > 0) {
      settlements.push({
        id: `${debtor.id}_${creditor.id}`,
        billId: '',
        fromParticipantId: debtor.id,
        toParticipantId: creditor.id,
        amount,
      });
      debtor.balance += amount;
      creditor.balance -= amount;
    }
    if (debtor.balance === 0) i++;
    if (creditor.balance === 0) j++;
  }
  return settlements;
}

// Helper: Tính trạng thái bill
function getBillStatus(totals, payments) {
  let done = true, partial = false;
  for (const pid in totals) {
    const total = totals[pid];
    const paid = payments.find(pay => pay.participantId === pid)?.amountPaid || 0;
    if (paid < total) done = false;
    if (paid > 0 && paid < total) partial = true;
  }
  if (done) return 'COMPLETED';
  if (partial) return 'PARTIAL';
  return 'UNPAID';
}

export function BillDetail({ bill }: { bill: Bill }) {
  // State thực tế
  const [participants, setParticipants] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [shares, setShares] = React.useState([]);
  const [payments, setPayments] = React.useState([]);
  const [settlements, setSettlements] = React.useState([]);
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Load tất cả dữ liệu liên quan bill khi bill thay đổi
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [partsData, itemsData, paymentsData, settlementsData, transactionsData] = await Promise.all([
          billSupabaseApi.getParticipants(bill.id),
          billSupabaseApi.getItems(bill.id),
          billSupabaseApi.getPayments(bill.id),
          billSupabaseApi.getSettlements(bill.id),
          billSupabaseApi.getPaymentTransactions(bill.id),
        ]);

        setParticipants(partsData);
        setItems(itemsData);
        setPayments(paymentsData);
        setSettlements(settlementsData);
        setTransactions(transactionsData);

        // Lấy shares cho tất cả items
        if (itemsData.length > 0) {
          const sharesData = await Promise.all(
            itemsData.map(item => billSupabaseApi.getItemShares(item.id))
          );
          setShares(sharesData.flat());
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu bill:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [bill.id]);

  // Handler thêm/xóa người tham gia
  const handleAddParticipant = async (name: string) => {
    try {
      await billSupabaseApi.addParticipant({ billId: bill.id, name });
      const updated = await billSupabaseApi.getParticipants(bill.id);
      setParticipants(updated);
    } catch (error) {
      console.error('Lỗi thêm người tham gia:', error);
    }
  };
  const handleRemoveParticipant = async (id: string) => {
    try {
      await billSupabaseApi.removeParticipant(id);
      const updated = await billSupabaseApi.getParticipants(bill.id);
      setParticipants(updated);
    } catch (error) {
      console.error('Lỗi xóa người tham gia:', error);
    }
  };

  // Handler thêm/xóa/sửa món ăn
  const handleAddItem = async (name: string, price: number) => {
    try {
      await billSupabaseApi.addItem({ billId: bill.id, name, price });
      const updated = await billSupabaseApi.getItems(bill.id);
      setItems(updated);
    } catch (error) {
      console.error('Lỗi thêm món:', error);
    }
  };
  const handleDeleteItem = async (id: string) => {
    try {
      await billSupabaseApi.removeItem(id);
      const updated = await billSupabaseApi.getItems(bill.id);
      setItems(updated);
    } catch (error) {
      console.error('Lỗi xóa món:', error);
    }
  };

  const handleEditItem = async (item) => {
    const newName = prompt('Tên món mới:', item.name);
    if (!newName) return;
    const newPrice = Number(prompt('Giá mới:', item.price));
    if (!newPrice) return;
    try {
      await billSupabaseApi.updateItem(item.id, { name: newName, price: newPrice });
      const updated = await billSupabaseApi.getItems(bill.id);
      setItems(updated);
    } catch (error) {
      console.error('Lỗi cập nhật món:', error);
    }
  };

  // Handler thêm/xóa chia món (item share)
  const handleToggleShare = async (itemId: string, participantId: string) => {
    try {
      const exist = shares.find(s => s.itemId === itemId && s.participantId === participantId);
      if (exist) {
        await billSupabaseApi.removeItemShare(exist.id);
      } else {
        await billSupabaseApi.addItemShare({ itemId, participantId });
      }
      // Reload shares
      const allShares = await Promise.all(
        items.map(item => billSupabaseApi.getItemShares(item.id))
      );
      setShares(allShares.flat());
    } catch (error) {
      console.error('Lỗi cập nhật chia tiền:', error);
    }
  };

  // Handler thanh toán (add payment)
  const handlePay = async (participantId: string, amount: number) => {
    if (!amount) return;
    try {
      await billSupabaseApi.addPayment({ billId: bill.id, participantId, amountPaid: amount });
      const updated = await billSupabaseApi.getPayments(bill.id);
      setPayments(updated);
    } catch (error) {
      console.error('Lỗi ghi nhận thanh toán:', error);
    }
  };

  // Tính toán tự động
  const totals = calculateTotals(participants, items, shares);
  const settlementsAuto = calculateSettlements(participants, totals, payments);
  const billStatus = getBillStatus(totals, payments);
  const totalAmount = Object.values(totals).reduce((a, b) => a + b, 0);
  const totalPaid = payments.reduce((a, b) => a + (b.amountPaid || 0), 0);
  const progress = totalAmount > 0 ? Math.min(100, (totalPaid / totalAmount) * 100) : 0;

  const getStatusIcon = () => {
    if (billStatus === 'COMPLETED') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (billStatus === 'PARTIAL') return <Clock className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-orange-600" />;
  };

  const getStatusColor = () => {
    if (billStatus === 'COMPLETED') return 'bg-green-50 border-green-200';
    if (billStatus === 'PARTIAL') return 'bg-yellow-50 border-yellow-200';
    return 'bg-orange-50 border-orange-200';
  };

  const getStatusLabel = () => {
    if (billStatus === 'COMPLETED') return 'Hoàn thành';
    if (billStatus === 'PARTIAL') return 'Đang thanh toán';
    return 'Chưa thanh toán';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{bill.name}</h1>
        <p className="text-gray-500 mt-1">
          Ngày tạo: {new Date(bill.createdDate).toLocaleDateString('vi-VN')}
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng Tiền</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {totalAmount.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-500">Đã Thanh Toán</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {totalPaid.toLocaleString('vi-VN')} ₫
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-500">Còn Lại</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {(totalAmount - totalPaid).toLocaleString('vi-VN')} ₫
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`border ${getStatusColor()}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trạng Thái</p>
                <p className="font-bold mt-2">{getStatusLabel()}</p>
              </div>
              {getStatusIcon()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm font-medium">Tiến độ thanh toán</p>
              <p className="text-sm font-bold">{Math.round(progress)}%</p>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Thiết Lập</TabsTrigger>
          <TabsTrigger value="split">Chia Tiền</TabsTrigger>
          <TabsTrigger value="payment">Thanh Toán</TabsTrigger>
          <TabsTrigger value="history">Lịch Sử</TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ParticipantList
              participants={participants}
              onRemove={handleRemoveParticipant}
              onAdd={handleAddParticipant}
            />
            <ItemList
              items={items}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onAdd={handleAddItem}
            />
          </div>
        </TabsContent>

        {/* Split Tab */}
        <TabsContent value="split" className="space-y-4">
          <ShareTable
            items={items}
            participants={participants}
            shares={shares}
            onToggleShare={handleToggleShare}
          />

          {/* Summary */}
          {participants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tóm Tắt Chi Phí</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {participants.map(p => {
                    const amount = totals[p.id] || 0;
                    const percent = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : 0;

                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {p.name[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium">{p.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">
                            {amount.toLocaleString('vi-VN')} ₫
                          </p>
                          <p className="text-xs text-gray-500">{percent}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-4">
          <PaymentTable
            participants={participants}
            payments={payments}
            onPay={handlePay}
          />
          <SettlementTable
            settlements={settlementsAuto}
            participants={participants}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <TransactionTable
            transactions={transactions}
            participants={participants}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
