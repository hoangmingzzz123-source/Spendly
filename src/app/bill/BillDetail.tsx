import React from 'react';
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
import { Bill } from './types';
import { ParticipantList } from './ParticipantList';
import { ItemList } from './ItemList';
import { ShareTable } from './ShareTable';
import { PaymentTable } from './PaymentTable';
import { SettlementTable } from './SettlementTable';
import { TransactionTable } from './TransactionTable';

import { billSupabaseApi } from './supabaseApi';


export function BillDetail({ bill }: { bill: Bill }) {
  // State thực tế
  const [participants, setParticipants] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [shares, setShares] = React.useState([]);
  const [payments, setPayments] = React.useState([]);
  const [settlements, setSettlements] = React.useState([]);
  const [transactions, setTransactions] = React.useState([]);

  // Load tất cả dữ liệu liên quan bill khi bill thay đổi
  React.useEffect(() => {
    billSupabaseApi.getParticipants(bill.id).then(setParticipants);
    billSupabaseApi.getItems(bill.id).then(setItems);
    // Lấy shares cho tất cả items
    Promise.all(
      items.map(item => billSupabaseApi.getItemShares(item.id))
    ).then(results => setShares(results.flat()));
    billSupabaseApi.getPayments(bill.id).then(setPayments);
    billSupabaseApi.getSettlements(bill.id).then(setSettlements);
    billSupabaseApi.getPaymentTransactions(bill.id).then(setTransactions);
  }, [bill.id, items.length]);

  // Handler thêm/xóa người tham gia
  const handleAddParticipant = async (name: string) => {
    await billSupabaseApi.addParticipant({ billId: bill.id, name });
    const updated = await billSupabaseApi.getParticipants(bill.id);
    setParticipants(updated);
  };
  const handleRemoveParticipant = async (id: string) => {
    await billSupabaseApi.removeParticipant(id);
    const updated = await billSupabaseApi.getParticipants(bill.id);
    setParticipants(updated);
  };

  // Handler thêm/xóa/sửa món ăn
  const handleAddItem = async (name: string, price: number) => {
    await billSupabaseApi.addItem({ billId: bill.id, name, price });
    const updated = await billSupabaseApi.getItems(bill.id);
    setItems(updated);
  };
  const handleDeleteItem = async (id: string) => {
    await billSupabaseApi.removeItem(id);
    const updated = await billSupabaseApi.getItems(bill.id);
    setItems(updated);
  };
  // Sửa món ăn (chỉ sửa tên/giá, popup đơn giản)
  const handleEditItem = async (item) => {
    const newName = prompt('Tên món mới:', item.name);
    if (!newName) return;
    const newPrice = Number(prompt('Giá mới:', item.price));
    if (!newPrice) return;
    await billSupabaseApi.updateItem(item.id, { name: newName, price: newPrice });
    const updated = await billSupabaseApi.getItems(bill.id);
    setItems(updated);
  };

  // Handler thêm/xóa chia món (item share)
  const handleToggleShare = async (itemId: string, participantId: string) => {
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
  };

  // Tính toán tự động
  const totals = calculateTotals(participants, items, shares);
  const settlementsAuto = calculateSettlements(participants, totals, payments);
  const billStatus = getBillStatus(totals, payments);
  const totalAmount = Object.values(totals).reduce((a, b) => a + b, 0);
  const totalPaid = payments.reduce((a, b) => a + (b.amountPaid || 0), 0);
  const progress = totalAmount > 0 ? Math.min(100, (totalPaid / totalAmount) * 100) : 0;

  // Handler thanh toán (add payment)
  const handlePay = async (participantId: string, amount: number) => {
    if (!amount) return;
    await billSupabaseApi.addPayment({ billId: bill.id, participantId, amountPaid: amount });
    const updated = await billSupabaseApi.getPayments(bill.id);
    setPayments(updated);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Chi tiết Bill: {bill.name}</h2>
      <div className="mb-2 flex flex-wrap gap-4 items-center">
        <span>Tổng tiền: <b>{totalAmount.toLocaleString('vi-VN')} ₫</b></span>
        <span>Đã trả: <b>{totalPaid.toLocaleString('vi-VN')} ₫</b></span>
        <span>Trạng thái: <b>{billStatus === 'COMPLETED' ? 'Hoàn thành' : billStatus === 'PARTIAL' ? 'Đang trả' : 'Chưa trả'}</b></span>
        <span>Ngày tạo: {new Date(bill.createdDate).toLocaleDateString()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: progress + '%' }}></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <ParticipantList participants={participants} onRemove={handleRemoveParticipant} onAdd={handleAddParticipant} />
          <ItemList items={items} onEdit={handleEditItem} onDelete={handleDeleteItem} onAdd={handleAddItem} />
          <ShareTable items={items} participants={participants} shares={shares} onToggleShare={handleToggleShare} />
          <div className="mt-4">
            <h4 className="font-bold mb-2">Tổng tiền mỗi người</h4>
            <ul>
              {participants.map(p => (
                <li key={p.id}>
                  {p.name}: <b>{(totals[p.id] || 0).toLocaleString('vi-VN')} ₫</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <PaymentTable participants={participants} payments={payments} onPay={handlePay} />
          <SettlementTable settlements={settlementsAuto} participants={participants} />
          <TransactionTable transactions={transactions} participants={participants} />
        </div>
      </div>
    </div>
  );
}
