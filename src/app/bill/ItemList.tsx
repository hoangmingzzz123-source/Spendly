import React from 'react';
import { Item } from './types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Plus, Edit2, Trash2, UtensilsCrossed } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

export function ItemList({ items, onEdit, onDelete, onAdd }: {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onAdd: (name: string, price: number) => void;
}) {
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [errors, setErrors] = React.useState<{ name?: string; price?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; price?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Vui lòng nhập tên món';
    }
    if (!price || Number(price) <= 0) {
      newErrors.price = 'Vui lòng nhập giá hợp lệ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd(name.trim(), Number(price));
    setName('');
    setPrice('');
    setErrors({});
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5" />
          Danh Sách Món
        </CardTitle>
        <CardDescription>Thêm và quản lý các món ăn trong bill</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 gap-3 md:flex md:gap-2">
            <Input
              placeholder="Tên món (VD: Cơm tấm...)"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (e.target.value.trim()) {
                  setErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              className={`flex-1 ${errors.name ? 'border-red-500' : ''}`}
            />
            <Input
              placeholder="Giá"
              className={`md:w-24 ${errors.price ? 'border-red-500' : ''}`}
              value={price}
              onChange={e => {
                setPrice(e.target.value.replace(/\D/g, ''));
                if (e.target.value) {
                  setErrors(prev => ({ ...prev, price: '' }));
                }
              }}
              inputMode="numeric"
            />
            <Button type="submit" className="gap-2 md:whitespace-nowrap">
              <Plus className="w-4 h-4" />
              Thêm
            </Button>
          </div>
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
        </form>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có món nào. Hãy thêm đồ ăn!</p>
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên Món</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-right">Hành Động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-blue-600">
                          {item.price.toLocaleString('vi-VN')} ₫
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1"
                          onClick={() => onEdit(item)}
                        >
                          <Edit2 className="w-3 h-3" />
                          Sửa
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Xóa
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Xóa Món</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc muốn xóa "{item.name}"?
                            </AlertDialogDescription>
                            <div className="flex gap-3 justify-end">
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(item.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Xóa
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="pt-2 border-t text-right">
              <p className="text-sm text-gray-600">
                Tổng tiền: <Badge className="ml-2 text-base px-3 py-1">{totalAmount.toLocaleString('vi-VN')} ₫</Badge>
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
