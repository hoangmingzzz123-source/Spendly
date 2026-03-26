import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyApi } from '../../lib/api';
import { useStore } from '../../lib/store';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';
import { Plus, Users, UserPlus, LogOut, Crown, Mail, AlertCircle } from 'lucide-react';

export function Family() {
  const queryClient = useQueryClient();
  const { user, setFamilyGroup } = useStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  // Fetch family group
  const { data: groupData, isLoading } = useQuery({
    queryKey: ['family-group'],
    queryFn: () => familyApi.getGroup(),
  });

  const familyGroup = groupData?.data;

  // Create group mutation
  const createMutation = useMutation({
    mutationFn: familyApi.createGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['family-group'] });
      setFamilyGroup(data.data);
      toast.success('Nhóm gia đình đã được tạo');
      setIsCreateOpen(false);
      setGroupName('');
    },
    onError: () => {
      toast.error('Không thể tạo nhóm gia đình');
    },
  });

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: familyApi.invite,
    onSuccess: () => {
      toast.success('Đã gửi lời mời');
      setIsInviteOpen(false);
      setInviteEmail('');
    },
    onError: () => {
      toast.error('Không thể gửi lời mời');
    },
  });

  // Leave mutation
  const leaveMutation = useMutation({
    mutationFn: familyApi.leave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-group'] });
      setFamilyGroup(null);
      toast.success('Đã rời khỏi nhóm gia đình');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Không thể rời nhóm');
    },
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName) {
      toast.error('Vui lòng nhập tên nhóm');
      return;
    }

    createMutation.mutate({ name: groupName });
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail) {
      toast.error('Vui lòng nhập email');
      return;
    }

    inviteMutation.mutate(inviteEmail);
  };

  const handleLeave = () => {
    if (window.confirm('Bạn có chắc muốn rời khỏi nhóm gia đình này?')) {
      leaveMutation.mutate();
    }
  };

  const isOwner = familyGroup && user && familyGroup.ownerId === user.id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gia đình</h1>
          <p className="text-muted-foreground">Chia sẻ và quản lý tài chính cùng gia đình</p>
        </div>
      </div>

      {!familyGroup ? (
        /* No Family Group - Create Prompt */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Chưa có nhóm gia đình</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Tạo nhóm gia đình để chia sẻ tài khoản và theo dõi chi tiêu chung với những người thân yêu
            </p>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo nhóm gia đình
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo nhóm gia đình mới</DialogTitle>
                  <DialogDescription>
                    Đặt tên cho nhóm gia đình của bạn
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Tên nhóm</Label>
                    <Input
                      id="groupName"
                      placeholder="Gia đình Nguyễn Văn A"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    Tạo nhóm
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        /* Family Group Details */
        <div className="space-y-6">
          {/* Group Info Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    {familyGroup.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {familyGroup.members.length} thành viên
                  </CardDescription>
                </div>
                {isOwner ? (
                  <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Mời thành viên
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Mời thành viên</DialogTitle>
                        <DialogDescription>
                          Nhập email của người bạn muốn mời vào nhóm gia đình
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleInvite} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="inviteEmail">Email</Label>
                          <Input
                            id="inviteEmail"
                            type="email"
                            placeholder="email@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={inviteMutation.isPending}>
                          Gửi lời mời
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button variant="outline" onClick={handleLeave}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Rời nhóm
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {familyGroup.members.map((memberId: string, index: number) => {
                  const isCurrentUser = user && memberId === user.id;
                  const isMemberOwner = memberId === familyGroup.ownerId;
                  
                  return (
                    <div key={memberId} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {isCurrentUser && user.name ? user.name.charAt(0).toUpperCase() : `M${index + 1}`}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {isCurrentUser ? user.name : `Thành viên ${index + 1}`}
                            {isCurrentUser && <span className="text-muted-foreground ml-2">(Bạn)</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isCurrentUser ? user.email : 'member@example.com'}
                          </p>
                        </div>
                      </div>
                      {isMemberOwner && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Chủ nhóm
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Features Info */}
          <Card>
            <CardHeader>
              <CardTitle>Tính năng nhóm gia đình</CardTitle>
              <CardDescription>
                Những gì bạn có thể làm với nhóm gia đình
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3 p-4 rounded-lg border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Chia sẻ tài khoản</h3>
                    <p className="text-sm text-muted-foreground">
                      Chia sẻ các tài khoản ngân hàng và ví để cùng theo dõi
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-4 rounded-lg border">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Thông báo chung</h3>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo về các giao dịch quan trọng của nhóm
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Notice */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Lưu ý:</strong> Đây là tính năng Beta. Hiện tại, nhóm gia đình chỉ cho phép chia sẻ thông tin cơ bản. 
                    Các tính năng nâng cao như chia sẻ giao dịch và ngân sách sẽ được cập nhật trong phiên bản tiếp theo.
                  </p>
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    Chỉ chủ nhóm mới có thể mời thêm thành viên. Thành viên có thể rời nhóm bất cứ lúc nào.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
