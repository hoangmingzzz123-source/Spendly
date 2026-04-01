import React from 'react';
import { Participant } from './types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Trash2, Users } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

export function ParticipantList({ participants, onRemove, onAdd }: {
  participants: Participant[];
  onRemove: (id: string) => void;
  onAdd: (name: string) => void;
}) {
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên người');
      return;
    }
    onAdd(name.trim());
    setName('');
    setError('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Người Tham Gia
        </CardTitle>
        <CardDescription>Quản lý những người trong bill này</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Nhập tên người..."
            value={name}
            onChange={e => {
              setName(e.target.value);
              if (e.target.value.trim()) {
                setError('');
              }
            }}
            className={error ? 'border-red-500' : ''}
            autoComplete="off"
          />
          <Button type="submit" className="gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Thêm
          </Button>
        </form>
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="space-y-2">
          {participants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có người nào. Hãy thêm người tham gia!
            </div>
          ) : (
            participants.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {p.name[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium">{p.name}</span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogTitle>Xóa Người</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc muốn xóa "{p.name}" khỏi bill? Tất cả dữ liệu liên quan sẽ bị xóa.
                    </AlertDialogDescription>
                    <div className="flex gap-3 justify-end">
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onRemove(p.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Xóa
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>

        {participants.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-500">
              Tổng: <Badge variant="secondary">{participants.length} người</Badge>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
