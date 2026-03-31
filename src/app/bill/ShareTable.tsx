import React from 'react';
import { Item, Participant, ItemShare } from './types';

export function ShareTable({ items, participants, shares, onToggleShare }: {
  items: Item[];
  participants: Participant[];
  shares: ItemShare[];
  onToggleShare: (itemId: string, participantId: string) => void;
}) {
  return (
    <div>
      <h3 className="font-bold mb-2">Gán món cho người</h3>
      <table className="min-w-full bg-white border mb-2">
        <thead>
          <tr>
            <th className="border px-2 py-1">Món</th>
            <th className="border px-2 py-1">Giá</th>
            {participants.map(p => (
              <th key={p.id} className="border px-2 py-1">{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td className="border px-2 py-1">{item.name}</td>
              <td className="border px-2 py-1">{item.price.toLocaleString('vi-VN')}</td>
              {participants.map(p => {
                const checked = shares.some(s => s.itemId === item.id && s.participantId === p.id);
                return (
                  <td key={p.id} className="border px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleShare(item.id, p.id)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
