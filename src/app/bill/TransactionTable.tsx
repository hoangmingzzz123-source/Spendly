import React from 'react';
import { PaymentTransaction, Participant } from './types';
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
import { History, ArrowRight } from 'lucide-react';

export function TransactionTable({ transactions, participants }: {
  transactions: PaymentTransaction[];
  participants: Participant[];
}) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Lịch Sử Thanh Toán
          </CardTitle>
          <CardDescription>Không có giao dịch nào</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Chưa có giao dịch nào được ghi lại</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Lịch Sử Thanh Toán
        </CardTitle>
        <CardDescription>Các giao dịch đã thực hiện</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Từ</TableHead>
                <TableHead className="text-center">Chuyển Tiền</TableHead>
                <TableHead>Đến</TableHead>
                <TableHead className="text-right">Số Tiền</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Ghi Chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => {
                const fromParticipant = participants.find(p => p.id === t.fromParticipantId);
                const toParticipant = participants.find(p => p.id === t.toParticipantId);

                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {fromParticipant?.name[0]?.toUpperCase()}
                        </div>
                        {fromParticipant?.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-gray-400">
                      <ArrowRight className="w-4 h-4 inline" />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {toParticipant?.name[0]?.toUpperCase()}
                        </div>
                        {toParticipant?.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-green-600">
                        {t.amount.toLocaleString('vi-VN')} ₫
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(t.paymentDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                      {t.note || '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
