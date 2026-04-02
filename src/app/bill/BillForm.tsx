import React from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function BillForm({ onSubmit }: { onSubmit: (data: { name: string; date: string }) => void }) {
  const [name, setName] = React.useState('');
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = React.useState<{ name?: string; date?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; date?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Vui lòng nhập tên bill';
    }
    if (!date) {
      newErrors.date = 'Vui lòng chọn ngày';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ name: name.trim(), date });
    setName('');
    setDate(new Date().toISOString().slice(0, 10));
    setErrors({});
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Tạo Bill Mới</CardTitle>
        <CardDescription>Nhập thông tin cơ bản cho hóa đơn của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bill-name">Tên Bill</Label>
            <Input
              id="bill-name"
              placeholder="VD: Ăn cơm trưa, Ăn lẩu..."
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (e.target.value.trim()) {
                  setErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              className={errors.name ? 'border-red-500' : ''}
              autoFocus
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-date">Ngày Tạo</Label>
            <Input
              id="bill-date"
              type="date"
              value={date}
              onChange={e => {
                setDate(e.target.value);
                if (e.target.value) {
                  setErrors(prev => ({ ...prev, date: '' }));
                }
              }}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
          </div>

          <Button type="submit" className="w-full mt-6">
            Tạo Bill
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
