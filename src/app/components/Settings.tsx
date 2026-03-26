import { useStore } from '../../lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exportApi } from '../../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Moon, Sun, Monitor, Download, FileText, Globe, User, Palette } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Settings() {
  const { user, theme, setTheme } = useStore();
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState('vi');
  const [currency, setCurrency] = useState('VND');

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: ({ type, year }: any) => exportApi.excel(type, year),
    onSuccess: (data) => {
      // In a real app, trigger file download
      console.log('Export data:', data);
      toast.success('Dữ liệu đã được xuất thành công');
    },
    onError: () => {
      toast.error('Không thể xuất dữ liệu');
    },
  });

  const handleExport = (type: string) => {
    const year = new Date().getFullYear();
    exportMutation.mutate({ type, year });
  };

  const themeOptions = [
    { value: 'light', label: 'Sáng', icon: Sun },
    { value: 'dark', label: 'Tối', icon: Moon },
    { value: 'system', label: 'Theo hệ thống', icon: Monitor },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Cài đặt</h1>
        <p className="text-muted-foreground">Quản lý cài đặt ứng dụng và tài khoản</p>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Thông tin tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-medium">{user?.name || 'Người dùng'}</p>
              <p className="text-sm text-muted-foreground">{user?.email || 'email@example.com'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Giao diện
          </CardTitle>
          <CardDescription>
            Tùy chỉnh giao diện ứng dụng theo sở thích của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Chủ đề</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value as any)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      theme === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label htmlFor="language">Ngôn ngữ</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Tiếng Việt
                  </div>
                </SelectItem>
                <SelectItem value="en">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    English
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="currency">Đơn vị tiền tệ</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VND">VNĐ (Vietnamese Dong)</SelectItem>
                <SelectItem value="USD">USD (US Dollar)</SelectItem>
                <SelectItem value="EUR">EUR (Euro)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Xuất dữ liệu
          </CardTitle>
          <CardDescription>
            Xuất dữ liệu tài chính của bạn sang Excel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => handleExport('transactions')}
            disabled={exportMutation.isPending}
          >
            <FileText className="w-4 h-4 mr-2" />
            Xuất tất cả giao dịch
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => handleExport('tax')}
            disabled={exportMutation.isPending}
          >
            <FileText className="w-4 h-4 mr-2" />
            Xuất báo cáo thuế
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Thông báo</CardTitle>
          <CardDescription>
            Quản lý cách bạn nhận thông báo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Thông báo giao dịch</p>
              <p className="text-sm text-muted-foreground">Nhận thông báo khi có giao dịch mới</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Nhắc nhở ngân sách</p>
              <p className="text-sm text-muted-foreground">Thông báo khi sắp vượt ngân sách</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Báo cáo hàng tháng</p>
              <p className="text-sm text-muted-foreground">Nhận báo cáo tổng hợp cuối tháng</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle>Bảo mật & Quyền riêng tư</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Thay đổi mật khẩu
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Quản lý phiên đăng nhập
          </Button>
          <Button variant="outline" className="w-full justify-start text-destructive">
            Xóa tài khoản
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          <p>Spendly v1.0.0</p>
          <p className="mt-1">© 2026 Spendly. All rights reserved.</p>
        </CardContent>
      </Card>
    </div>
  );
}
