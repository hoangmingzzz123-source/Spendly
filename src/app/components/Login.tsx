import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useStore } from '../../lib/store';
import { authApi } from '../../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Wallet, Loader2, Eye, EyeOff, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('[LOGIN] Starting login attempt...');
      const response = await authApi.login({ email, password });
      console.log('[LOGIN] Server response:', response);
      console.log('[LOGIN] response.data:', response.data);
      console.log('[LOGIN] response.data?.session:', response.data?.session);
      console.log('[LOGIN] response.data?.session?.access_token:', response.data?.session?.access_token);
      
      if (response.data?.session?.access_token) {
        console.log('[LOGIN] Setting access token...');
        setAccessToken(response.data.session.access_token);
        console.log('[LOGIN] Token set, checking localStorage:', localStorage.getItem('access_token'));
        
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.user_metadata?.name || email,
        });
        
        console.log('[LOGIN] Login successful, navigating to home');
        toast.success('Chào mừng bạn trở lại!');
        navigate('/');
      } else {
        console.error('[LOGIN] No session token in response');
        toast.error('Phản hồi đăng nhập không hợp lệ');
      }
    } catch (error: any) {
      console.error('[LOGIN] Login error:', error);
      toast.error(error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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
                Quản lý tài chính<br />
                <span className="text-white/80">thông minh & dễ dàng</span>
              </h1>
              <p className="mt-4 text-lg text-white/70 max-w-md">
                Theo dõi thu chi, đặt mục tiêu tiết kiệm, và nhận tư vấn AI miễn phí với Gemini.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Sparkles, label: 'AI Tư vấn', desc: 'Gemini miễn phí' },
                { icon: Shield, label: 'Bảo mật', desc: 'Supabase Auth' },
                { icon: Zap, label: 'Tức thì', desc: 'Real-time sync' },
              ].map((f) => (
                <div key={f.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <f.icon className="w-6 h-6 mb-2" />
                  <p className="font-semibold text-sm">{f.label}</p>
                  <p className="text-xs text-white/60">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/40">
            &copy; 2026 Spendly. Made with love in Vietnam.
          </p>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Spendly</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Chào mừng trở lại
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Đăng nhập để tiếp tục quản lý tài chính
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-12 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 px-4 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 px-4 pr-12 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/30 transition-all duration-200"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Đăng nhập
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Chưa có tài khoản? </span>
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold text-sm transition-colors">
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
