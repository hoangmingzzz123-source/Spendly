import React from 'react';
import { Settlement, Participant } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export function SettlementTable({ settlements, participants }: {
  settlements: Settlement[];
  participants: Participant[];
}) {
  if (settlements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Kết Quả Chia Bill
          </CardTitle>
          <CardDescription>Không có ai cần thanh toán thêm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-green-600">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="font-medium">Mọi người đã thanh toán đủ!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = settlements.reduce((sum, s) => sum + s.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="w-5 h-5" />
          Kết Quả Chia Bill
        </CardTitle>
        <CardDescription>Các khoản thanh toán cần thực hiện</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {settlements.map((settlement, idx) => {
            const fromParticipant = participants.find(p => p.id === settlement.fromParticipantId);
            const toParticipant = participants.find(p => p.id === settlement.toParticipantId);

            return (
              <div
                key={settlement.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {fromParticipant?.name[0]?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-900">{fromParticipant?.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-orange-600">
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-xs font-medium">thanh toán</span>
                  </div>

                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-semibold text-gray-900">{toParticipant?.name}</span>
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {toParticipant?.name[0]?.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="ml-4 text-right">
                  <Badge className="bg-orange-600 text-base px-4 py-2 whitespace-nowrap">
                    {settlement.amount.toLocaleString('vi-VN')} ₫
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Tổng tiền cần thanh toán:</p>
            <Badge className="bg-blue-600 text-lg px-4 py-2">
              {totalAmount.toLocaleString('vi-VN')} ₫
            </Badge>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            <strong>Lưu ý:</strong> Các khoản thanh toán được tính toán tối ưu để giảm số lần chuyển tiền giữa các nhân.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
