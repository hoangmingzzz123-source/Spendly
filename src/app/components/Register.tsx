import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useStore } from '../../lib/store';
import { authApi } from '../../lib/api';
import { supabase, markLoginSuccess, setCachedToken } from '../../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Wallet, Loader2, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

export function Register() {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.register({ name, email, password });
      
      if (response.data?.user) {
        // Use Supabase client directly after registration — session is managed with auto-refresh
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data.session) {
          // Mark login success to enable grace period for API calls
          markLoginSuccess();

          setCachedToken(data.session.access_token);
          setAccessToken(data.session.access_token);
          setUser({
            id: data.user.id,
            email: data.user.email ?? email,
            name: data.user.user_metadata?.name || name,
          });

          toast.success('Chào mừng bạn đến với Spendly!');

          // Small delay to ensure state is fully propagated
          setTimeout(() => {
            navigate('/');
          }, 50);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Theo dõi thu chi tự động',
    'AI tư vấn tài chính miễn phí',
    'Quét hóa đơn bằng camera',
    'Ngân sách & mục tiêu tiết kiệm',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-32 left-20 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <Wallet className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Spendly</span>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-extrabold leading-tight">
                Bắt đầu hành trình<br />
                <span className="text-white/80">tài chính thông minh</span>
              </h1>
            </div>

            <div className="space-y-4">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-lg">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/40">
            &copy; 2026 Spendly. Hoàn toàn miễn phí.
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-emerald-50/50 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Spendly</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tạo tài khoản</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Miễn phí, không cần thẻ tín dụng
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Họ tên</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="h-12 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 px-4 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-12 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 px-4 shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  className="h-12 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 px-4 pr-12 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/30 transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Tạo tài khoản
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Đã có tài khoản? </span>
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold text-sm">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}