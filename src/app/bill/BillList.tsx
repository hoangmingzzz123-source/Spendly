import React from 'react';
import { billSupabaseApi } from './supabaseApi';
import { Bill } from './types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

export function BillList({ onCreate, onViewDetail }: {
  onCreate: () => void;
  onViewDetail: (bill: Bill) => void;
}) {
  const [bills, setBills] = React.useState<Bill[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadBills = async () => {
      try {
        setLoading(true);
        const data = await billSupabaseApi.getBills();
        setBills(data);
      } catch (error) {
        console.error('Lỗi tải danh sách bill:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBills();
  }, []);

  const handleDelete = async (billId: string) => {
    try {
      await billSupabaseApi.deleteBill(billId);
      setBills(bills.filter(b => b.id !== billId));
    } catch (error) {
      console.error('Lỗi xóa bill:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      'PENDING': 'secondary',
      'COMPLETED': 'default',
      'PARTIAL': 'outline',
    };
    const labels: { [key: string]: string } = {
      'PENDING': 'Chưa thanh toán',
      'COMPLETED': 'Hoàn thành',
      'PARTIAL': 'Đang thanh toán',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh Sách Bill</h1>
          <p className="text-gray-500 mt-1">Quản lý các hóa đơn và chia tiền của bạn</p>
        </div>
        <Button onClick={onCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo Bill Mới
        </Button>
      </div>

      {bills.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <p className="text-gray-500 mb-4">Bạn chưa có bill nào</p>
            <Button onClick={onCreate} variant="outline">Tạo bill đầu tiên</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bills.map((bill) => (
            <Card key={bill.id} className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewDetail(bill)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate">{bill.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(bill.createdDate).toLocaleDateString('vi-VN')}
                    </CardDescription>
                  </div>
                  {getStatusBadge(bill.status)}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-2xl font-bold text-blue-600">
                  {bill.totalAmount.toLocaleString('vi-VN')} ₫
                </div>
                <p className="text-sm text-gray-500 mt-1">Tổng tiền</p>
              </CardContent>
              <div className="px-6 py-3 pt-0 border-t flex gap-2 justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogTitle>Xóa Bill</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc muốn xóa bill "{bill.name}"? Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                    <div className="flex gap-3 justify-end">
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(bill.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Xóa
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
