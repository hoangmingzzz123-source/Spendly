import React from 'react';
import { Item } from './types';

export function ItemList({ items, onEdit, onDelete, onAdd }: {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onAdd: (name: string, price: number) => void;
}) {
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  return (
    <div>
      <h3 className="font-bold mb-2">Danh sách món ăn</h3>
      <form
        className="flex gap-2 mb-2"
        onSubmit={e => {
          e.preventDefault();
          if (name.trim() && price) {
            onAdd(name.trim(), Number(price));
            setName('');
            setPrice('');
          }
        }}
      >
        <input
          className="border rounded px-2 py-1"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Tên món..."
        />
        <input
          className="border rounded px-2 py-1 w-24"
          value={price}
          onChange={e => setPrice(e.target.value.replace(/\D/g, ''))}
          placeholder="Giá"
          inputMode="numeric"
        />
        <button className="btn btn-xs btn-primary" type="submit">Thêm</button>
      </form>
      <table className="min-w-full bg-white border mb-2">
        <thead>
          <tr>
            <th className="border px-2 py-1">Tên món</th>
            <th className="border px-2 py-1">Giá</th>
            <th className="border px-2 py-1">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td className="border px-2 py-1">{item.name}</td>
              <td className="border px-2 py-1">{item.price.toLocaleString('vi-VN')}</td>
              <td className="border px-2 py-1">
                <button className="btn btn-xs btn-info mr-1" onClick={() => onEdit(item)}>Sửa</button>
                <button className="btn btn-xs btn-danger" onClick={() => onDelete(item.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
