import React from 'react';
import { Participant } from './types';

export function ParticipantList({ participants, onRemove, onAdd }: {
  participants: Participant[];
  onRemove: (id: string) => void;
  onAdd: (name: string) => void;
}) {
  const [name, setName] = React.useState('');
  return (
    <div>
      <h3 className="font-bold mb-2">Người tham gia</h3>
      <form
        className="flex gap-2 mb-2"
        onSubmit={e => {
          e.preventDefault();
          if (name.trim()) {
            onAdd(name.trim());
            setName('');
          }
        }}
      >
        <input
          className="border rounded px-2 py-1"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Tên người..."
        />
        <button className="btn btn-xs btn-primary" type="submit">Thêm</button>
      </form>
      <ul className="mb-2">
        {participants.map(p => (
          <li key={p.id} className="flex items-center gap-2 mb-1">
            <span>{p.name}</span>
            <button className="btn btn-xs btn-danger" onClick={() => onRemove(p.id)}>Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
