import React from 'react';
import { billSupabaseApi } from './supabaseApi';
import { Bill } from './types';

export function BillList({ onCreate, onViewDetail }: {
  onCreate: () => void;
  onViewDetail: (bill: Bill) => void;
}) {
  const [bills, setBills] = React.useState<Bill[]>([]);
  React.useEffect(() => {
    billSupabaseApi.getBills().then(setBills);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách Bill</h1>
        <button className="btn btn-primary" onClick={onCreate}>Tạo Bill</button>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Tên Bill</th>
            <th className="border px-4 py-2">Tổng tiền</th>
            <th className="border px-4 py-2">Trạng thái</th>
            <th className="border px-4 py-2">Ngày tạo</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill) => (
            <tr key={bill.id}>
              <td className="border px-4 py-2">{bill.name}</td>
              <td className="border px-4 py-2">{bill.totalAmount.toLocaleString('vi-VN')}</td>
              <td className="border px-4 py-2">{bill.status}</td>
              <td className="border px-4 py-2">{new Date(bill.createdDate).toLocaleDateString()}</td>
              <td className="border px-4 py-2">
                <button className="btn btn-sm btn-info mr-2" onClick={() => onViewDetail(bill)}>Chi tiết</button>
                <button className="btn btn-sm btn-danger">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
