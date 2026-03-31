import React from 'react';

import { BillList } from './BillList';
import { BillDetail } from './BillDetail';
import { BillForm } from './BillForm';
import { Bill } from './types';

type View = 'list' | 'form' | 'detail';

export default function BillPage() {
  const [view, setView] = React.useState<View>('list');
  const [selectedBill, setSelectedBill] = React.useState<Bill | null>(null);

  // Handler khi tạo bill mới
  const handleCreateBill = () => {
    setSelectedBill(null);
    setView('form');
  };

  // Handler khi submit form tạo bill
  const handleSubmitBill = (data: { name: string; date: string }) => {
    // TODO: Gọi API tạo bill, sau đó chuyển sang detail
    const newBill: Bill = {
      id: Math.random().toString(36).slice(2),
      name: data.name,
      createdDate: data.date,
      status: 'PENDING',
      totalAmount: 0,
    };
    setSelectedBill(newBill);
    setView('detail');
  };

  // Handler khi chọn xem chi tiết bill
  const handleViewDetail = (bill: Bill) => {
    setSelectedBill(bill);
    setView('detail');
  };

  // Handler quay lại danh sách
  const handleBackToList = () => {
    setSelectedBill(null);
    setView('list');
  };

  if (view === 'form') {
    return (
      <div>
        <button className="btn btn-secondary mb-4" onClick={handleBackToList}>← Quay lại</button>
        <BillForm onSubmit={handleSubmitBill} />
      </div>
    );
  }

  if (view === 'detail' && selectedBill) {
    return (
      <div>
        <button className="btn btn-secondary mb-4" onClick={handleBackToList}>← Quay lại</button>
        <BillDetail bill={selectedBill} />
      </div>
    );
  }

  // Danh sách bill
  return <BillList onCreate={handleCreateBill} onViewDetail={handleViewDetail} />;
}
