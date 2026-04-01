import React from 'react';
import { BillList } from './BillList';
import { BillDetail } from './BillDetail';
import { BillForm } from './BillForm';
import { Bill } from './types';
import { billSupabaseApi } from './supabaseApi';
import { Button } from '../components/ui/button';
import { ChevronLeft } from 'lucide-react';

type View = 'list' | 'form' | 'detail';

export default function BillPage() {
  const [view, setView] = React.useState<View>('list');
  const [selectedBill, setSelectedBill] = React.useState<Bill | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState('');

  // Handler khi tạo bill mới
  const handleCreateBill = () => {
    setSelectedBill(null);
    setView('form');
    setError('');
  };

  // Handler khi submit form tạo bill
  const handleSubmitBill = async (data: { name: string; date: string }) => {
    try {
      setIsCreating(true);
      setError('');

      // Gọi API tạo bill
      const newBill = await billSupabaseApi.createBill({
        name: data.name,
        createdDate: data.date,
        status: 'PENDING',
        totalAmount: 0,
      });

      setSelectedBill(newBill);
      setView('detail');
    } catch (err) {
      setError('Lỗi tạo bill: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
      console.error('Lỗi tạo bill:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // Handler khi chọn xem chi tiết bill
  const handleViewDetail = (bill: Bill) => {
    setSelectedBill(bill);
    setView('detail');
    setError('');
  };

  // Handler quay lại danh sách
  const handleBackToList = () => {
    setSelectedBill(null);
    setView('list');
    setError('');
  };

  if (view === 'form') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBackToList} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Quay Lại
        </Button>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}
        <BillForm onSubmit={handleSubmitBill} />
      </div>
    );
  }

  if (view === 'detail' && selectedBill) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBackToList} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Quay Lại
        </Button>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}
        <BillDetail bill={selectedBill} />
      </div>
    );
  }

  // Danh sách bill
  return <BillList onCreate={handleCreateBill} onViewDetail={handleViewDetail} />;
}
