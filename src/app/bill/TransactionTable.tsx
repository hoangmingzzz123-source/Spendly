import React from 'react';
import { PaymentTransaction, Participant } from './types';

export function TransactionTable({ transactions, participants }: {
  transactions: PaymentTransaction[];
  participants: Participant[];
}) {
  return (
    <div>
      <h3 className="font-bold mb-2">Lịch sử thanh toán</h3>
      <table className="min-w-full bg-white border mb-2">
        <thead>
          <tr>
            <th className="border px-2 py-1">Từ</th>
            <th className="border px-2 py-1">Đến</th>
            <th className="border px-2 py-1">Số tiền</th>
            <th className="border px-2 py-1">Ngày</th>
            <th className="border px-2 py-1">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td className="border px-2 py-1">{participants.find(p => p.id === t.fromParticipantId)?.name}</td>
              <td className="border px-2 py-1">{participants.find(p => p.id === t.toParticipantId)?.name}</td>
              <td className="border px-2 py-1">{t.amount.toLocaleString('vi-VN')}</td>
              <td className="border px-2 py-1">{new Date(t.paymentDate).toLocaleDateString()}</td>
              <td className="border px-2 py-1">{t.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
