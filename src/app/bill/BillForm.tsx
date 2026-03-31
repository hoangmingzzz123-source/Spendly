import React from 'react';

export function BillForm({ onSubmit }: { onSubmit: (data: { name: string; date: string }) => void }) {
  const [name, setName] = React.useState('');
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));

  return (
    <form
      className="space-y-4"
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ name, date });
      }}
    >
      <div>
        <label className="block font-medium mb-1">Tên bill</label>
        <input
          className="border rounded px-3 py-2 w-full"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Ngày</label>
        <input
          type="date"
          className="border rounded px-3 py-2 w-full"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </div>
      <button className="btn btn-primary w-full" type="submit">Lưu</button>
    </form>
  );
}
