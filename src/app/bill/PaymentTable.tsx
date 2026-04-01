import React from 'react';
import { Participant, Payment } from './types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { CreditCard, Plus, X, Check } from 'lucide-react';

export function PaymentTable({ participants, payments, onPay }: {
  participants: Participant[];
  payments: Payment[];
  onPay: (participantId: string, amount: number) => void;
}) {
  const [payingId, setPayingId] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (participantId: string) => {
    if (!amount || Number(amount) <= 0) {
      setError('Vui lòng nhập số tiền > 0');
      return;
    }
    onPay(participantId, Number(amount));
    setAmount('');
    setPayingId(null);
    setError('');
  };

  const totalPaid = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Thanh Toán
        </CardTitle>
        <CardDescription>Ghi lại số tiền mỗi người đã thanh toán</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Người</TableHead>
                <TableHead className="text-right">Đã Thanh Toán</TableHead>
                <TableHead className="text-right">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map(p => {
                const payment = payments.find(pay => pay.participantId === p.id);
                const amountPaid = payment?.amountPaid || 0;
                const isEditing = payingId === p.id;

                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {p.name[0]?.toUpperCase()}
                        </div>
                        {p.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {amountPaid > 0 ? (
                        <Badge className="bg-green-600 text-base px-3 py-1">
                          {amountPaid.toLocaleString('vi-VN')} ₫
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">Chưa thanh toán</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex gap-2 justify-end">
                          <Input
                            type="text"
                            value={amount}
                            onChange={e => {
                              setAmount(e.target.value.replace(/\D/g, ''));
                              if (e.target.value) {
                                setError('');
                              }
                            }}
                            placeholder="Số tiền"
                            inputMode="numeric"
                            className="w-24"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            className="gap-1"
                            onClick={() => handleSubmit(p.id)}
                          >
                            <Check className="w-4 h-4" />
                            OK
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1"
                            onClick={() => {
                              setPayingId(null);
                              setAmount('');
                              setError('');
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => setPayingId(p.id)}
                        >
                          <Plus className="w-4 h-4" />
                          Thanh Toán
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="pt-3 border-t text-right">
          <p className="text-sm text-gray-600">
            Tổng đã thanh toán: <Badge className="ml-2 text-base px-3 py-1">{totalPaid.toLocaleString('vi-VN')} ₫</Badge>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
