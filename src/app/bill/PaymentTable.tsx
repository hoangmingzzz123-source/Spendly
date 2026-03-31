import React from 'react';
import { Participant, Payment } from './types';

export function PaymentTable({ participants, payments, onPay }: {
  participants: Participant[];
  payments: Payment[];
  onPay: (participantId: string, amount: number) => void;
}) {
  const [payingId, setPayingId] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState('');
  return (
    <div>
      <h3 className="font-bold mb-2">Người thanh toán</h3>
      <table className="min-w-full bg-white border mb-2">
        <thead>
          <tr>
            <th className="border px-2 py-1">Người</th>
            <th className="border px-2 py-1">Đã trả</th>
            <th className="border px-2 py-1">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {participants.map(p => {
            const payment = payments.find(pay => pay.participantId === p.id);
            return (
              <tr key={p.id}>
                <td className="border px-2 py-1">{p.name}</td>
                <td className="border px-2 py-1">{(payment?.amountPaid || 0).toLocaleString('vi-VN')}</td>
                <td className="border px-2 py-1">
                  {payingId === p.id ? (
                    <form
                      className="flex gap-1"
                      onSubmit={e => {
                        e.preventDefault();
                        if (amount) {
                          onPay(p.id, Number(amount));
                          setAmount('');
                          setPayingId(null);
                        }
                      }}
                    >
                      <input
                        className="border rounded px-1 w-20"
                        value={amount}
                        onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
                        placeholder="Số tiền"
                        inputMode="numeric"
                        autoFocus
                      />
                      <button className="btn btn-xs btn-success" type="submit">Lưu</button>
                      <button className="btn btn-xs btn-secondary" type="button" onClick={() => setPayingId(null)}>Hủy</button>
                    </form>
                  ) : (
                    <button className="btn btn-xs btn-success" onClick={() => setPayingId(p.id)}>Thanh toán</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
