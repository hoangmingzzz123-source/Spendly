import React from 'react';
import { Item, Participant, ItemShare } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Users2 } from 'lucide-react';

export function ShareTable({ items, participants, shares, onToggleShare }: {
  items: Item[];
  participants: Participant[];
  shares: ItemShare[];
  onToggleShare: (itemId: string, participantId: string) => void;
}) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 text-center text-gray-500">
          Hãy thêm món ăn trước khi chia tiền
        </CardContent>
      </Card>
    );
  }

  if (participants.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 text-center text-gray-500">
          Hãy thêm người tham gia trước khi chia tiền
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users2 className="w-5 h-5" />
          Chia Tiền Theo Món
        </CardTitle>
        <CardDescription>Chọn người để chia từng món ăn</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="min-w-[150px]">Món</TableHead>
                <TableHead className="text-right min-w-[100px]">Giá</TableHead>
                {participants.map(p => (
                  <TableHead key={p.id} className="text-center min-w-[120px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {p.name[0]?.toUpperCase()}
                      </div>
                      <span className="text-xs">{p.name}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => {
                const itemShares = shares.filter(s => s.itemId === item.id);
                const shareCount = itemShares.length || 1;
                const perPerson = item.price / shareCount;

                return (
                  <TableRow key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Chia: {itemShares.length} người @ {perPerson.toLocaleString('vi-VN')} ₫
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-blue-600">
                      {item.price.toLocaleString('vi-VN')} ₫
                    </TableCell>
                    {participants.map(p => {
                      const isChecked = shares.some(s => s.itemId === item.id && s.participantId === p.id);
                      return (
                        <TableCell key={`${item.id}-${p.id}`} className="text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => onToggleShare(item.id, p.id)}
                              className="w-5 h-5"
                            />
                          </div>
                          {isChecked && (
                            <p className="text-xs text-green-600 mt-1 font-medium">
                              {perPerson.toLocaleString('vi-VN')} ₫
                            </p>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Mẹo:</strong> Chọn người cần chia từng món. Nếu không ai được chọn, mặc định sẽ chia đều cho tất cả.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
