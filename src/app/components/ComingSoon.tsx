import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Calendar, 
  Bell,
  Users,
  BarChart3,
  Zap,
  Shield,
  Smartphone,
  Lock,
  Crown
} from 'lucide-react';
import { Link } from 'react-router';

export function ComingSoon() {
  const upcomingFeatures = [
    {
      title: 'Đầu tư thông minh',
      description: 'Theo dõi danh mục đầu tư cổ phiếu, crypto, vàng với biểu đồ real-time',
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-500',
      status: 'Sắp ra mắt',
      statusColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      title: 'Kế hoạch tài chính AI',
      description: 'AI tự động tạo kế hoạch chi tiêu, đầu tư dựa trên thu nhập và mục tiêu',
      icon: Sparkles,
      color: 'from-purple-500 to-violet-500',
      status: 'Q2 2026',
      statusColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      title: 'Tích hợp ngân hàng',
      description: 'Kết nối trực tiếp với tài khoản ngân hàng để tự động đồng bộ giao dịch',
      icon: Shield,
      color: 'from-blue-500 to-indigo-500',
      status: 'Đang phát triển',
      statusColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      title: 'Đa tiền tệ',
      description: 'Hỗ trợ quản lý nhiều loại tiền tệ với tỷ giá tự động cập nhật',
      icon: Target,
      color: 'from-orange-500 to-amber-500',
      status: 'Q3 2026',
      statusColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    },
    {
      title: 'App mobile',
      description: 'Ứng dụng di động native iOS và Android với đầy đủ tính năng',
      icon: Smartphone,
      color: 'from-pink-500 to-rose-500',
      status: 'Sắp ra mắt',
      statusColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    },
    {
      title: 'Bảo mật 2FA',
      description: 'Xác thực 2 yếu tố để bảo vệ tài khoản và dữ liệu tài chính',
      icon: Lock,
      color: 'from-red-500 to-pink-500',
      status: 'Q2 2026',
      statusColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
  ];

  const currentFeatures = [
    { icon: Users, label: 'Family Sharing', desc: 'Chia sẻ chi tiêu gia đình' },
    { icon: Bell, label: 'Smart Reminders', desc: 'Nhắc nhở thông minh' },
    { icon: BarChart3, label: 'Analytics', desc: 'Phân tích chi tiết' },
    { icon: Zap, label: 'AI Chat', desc: 'Trợ lý AI miễn phí' },
    { icon: Target, label: 'Goals', desc: 'Mục tiêu tiết kiệm' },
    { icon: Calendar, label: 'Budgets', desc: 'Ngân sách tháng' },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 pb-24 md:pb-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-10" />
        <div className="relative">
          <h1 className="text-3xl lg:text-4xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Tính năng sắp ra mắt
            </span>
          </h1>
          <p className="text-muted-foreground mt-2 ml-1">
            🚀 Những tính năng mới đang được phát triển để nâng cao trải nghiệm của bạn
          </p>
        </div>
      </div>

      {/* Current Features */}
      <Card className="border-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:to-emerald-950 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-emerald-600" />
            <CardTitle>✅ Tính năng hiện tại</CardTitle>
          </div>
          <CardDescription>Spendly đã có đầy đủ tính năng quản lý tài chính cá nhân</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {currentFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-900/50"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{feature.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {upcomingFeatures.map((feature, index) => (
          <Card
            key={index}
            className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
            
            <CardHeader className="relative z-10">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} opacity-10 group-hover:opacity-20 flex items-center justify-center transition-opacity duration-300`}>
                  <feature.icon className={`w-6 h-6 bg-gradient-to-br ${feature.color} bg-clip-text`} style={{ WebkitTextFillColor: 'transparent' }} />
                </div>
                <Badge className={feature.statusColor}>{feature.status}</Badge>
              </div>
              <CardTitle className="text-lg mt-3">{feature.title}</CardTitle>
              <CardDescription className="mt-2">{feature.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl group-hover:border-indigo-600 group-hover:text-indigo-600 dark:group-hover:border-indigo-400 dark:group-hover:text-indigo-400 transition-colors"
                disabled
              >
                Sắp ra mắt
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <Card className="border-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTJjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl">💡 Góp ý tính năng mới</CardTitle>
          <CardDescription className="text-white/80 text-base mt-2">
            Bạn có ý tưởng hay cho Spendly? Hãy cho chúng tôi biết!
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/help" className="flex-1">
              <Button className="w-full bg-white text-indigo-600 hover:bg-gray-100 rounded-xl shadow-lg font-semibold">
                Gửi góp ý
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-2 border-white text-white hover:bg-white/10 rounded-xl font-semibold"
              >
                Về trang chủ
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
