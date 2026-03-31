import React from 'react';
import { Settlement, Participant } from './types';

export function SettlementTable({ settlements, participants }: {
  settlements: Settlement[];
  participants: Participant[];
}) {
  return (
    <div>
      <h3 className="font-bold mb-2">Kết quả chia bill</h3>
      <table className="min-w-full bg-white border mb-2">
        <thead>
          <tr>
            <th className="border px-2 py-1">Từ</th>
            <th className="border px-2 py-1">Đến</th>
            <th className="border px-2 py-1">Số tiền</th>
          </tr>
        </thead>
        <tbody>
          {settlements.map(s => (
            <tr key={s.id}>
              <td className="border px-2 py-1">{participants.find(p => p.id === s.fromParticipantId)?.name}</td>
              <td className="border px-2 py-1">{participants.find(p => p.id === s.toParticipantId)?.name}</td>
              <td className="border px-2 py-1">{s.amount.toLocaleString('vi-VN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
