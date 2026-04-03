import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useStore } from '../../lib/store';
import { authApi } from '../../lib/api';
import { supabase, markLoginSuccess, API_BASE } from '../../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Wallet, Loader2, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { setUser, setAccessToken, setDemo } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDemoMode = () => {
    console.log('[Login] Activating Demo Mode...');
    // Set demo user
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@spendly.com',
      name: 'Demo User',
    };
    
    setUser(demoUser);
    setAccessToken('demo-token');
    setDemo(true); // Enable demo mode
    
    toast.success('🎉 Chào mừng đến Demo Mode! Dữ liệu mẫu đã được kích hoạt.');
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Don't clear session before login - Supabase handles session replacement automatically
      console.log('[Login] Starting login process...');
      
      // Use Supabase client directly — session is managed with auto-refresh
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (data.session) {
        console.log('[Login] ✅ Login successful, session created');
        
        // Mark login success to enable grace period for API calls
        markLoginSuccess();

        setAccessToken(data.session.access_token);
        
        // Persist token immediately
        try {
          localStorage.setItem('access_token', data.session.access_token);
          console.log('[Login] ✅ Token persisted to localStorage');
        } catch (err) {
          console.error('[Login] Failed to persist token:', err);
        }
        
        setUser({
          id: data.user.id,
          email: data.user.email ?? email,
          name: data.user.user_metadata?.name || email,
        });

        toast.success('Chào mừng bạn trở lại!');

        // Navigate immediately - no delay needed
        console.log('[Login] ✅ Navigating to dashboard...');
        navigate('/');
      }
    } catch (error: any) {
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
                { icon: CheckCircle2, label: 'AI Tư vấn', desc: 'Gemini miễn phí' },
                { icon: AlertCircle, label: 'Bảo mật', desc: 'Supabase Auth' },
                { icon: RefreshCw, label: 'Tức thì', desc: 'Real-time sync' },
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
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Đăng nhập để quản lý tài chính của bạn
            </p>
            
            {/* Debug button - only show in dev */}
            <button
              onClick={async () => {
                console.group('🔧 System Diagnostic');
                try {
                  // Test 1: Backend health
                  console.log('\n1️⃣ Testing backend health...');
                  const healthRes = await fetch(`https://${(window as any).projectId || 'unknown'}.supabase.co/functions/v1/make-server-f5f5b39c/health`);
                  console.log('Backend status:', healthRes.ok ? '✅ ONLINE' : '❌ OFFLINE');
                  if (healthRes.ok) {
                    const health = await healthRes.json();
                    console.log('Health data:', health);
                  }
                  
                  // Test 2: Backend env
                  console.log('\n2️⃣ Testing backend environment...');
                  const envRes = await fetch(`https://${(window as any).projectId || 'unknown'}.supabase.co/functions/v1/make-server-f5f5b39c/debug/env`);
                  if (envRes.ok) {
                    const env = await envRes.json();
                    console.log('Backend env:', env);
                  } else {
                    console.error('❌ Env check failed:', await envRes.text());
                  }
                  
                  // Test 3: Token status
                  console.log('\n3️⃣ Checking local token...');
                  await (window as any).debugToken();
                  
                  // Test 4: Backend token validation
                  console.log('\n4️⃣ Testing backend token validation...');
                  const accessToken = localStorage.getItem('access_token');
                  if (accessToken) {
                    const tokenRes = await fetch(`https://${(window as any).projectId || 'unknown'}.supabase.co/functions/v1/make-server-f5f5b39c/debug/token`, {
                      headers: {
                        'Authorization': `Bearer ${accessToken}`,
                      },
                    });
                    if (tokenRes.ok) {
                      const tokenData = await tokenRes.json();
                      console.log('✅ Backend token validation:', tokenData);
                    } else {
                      const tokenError = await tokenRes.json().catch(() => ({ error: 'Unknown error' }));
                      console.error('❌ Backend token validation failed:', tokenError);
                    }
                  } else {
                    console.warn('⚠️ No access token in localStorage');
                  }
                  
                  console.log('\n✅ Diagnostic complete!');
                } catch (err) {
                  console.error('❌ Diagnostic failed:', err);
                }
                console.groupEnd();
              }}
              className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              🔧 Run System Diagnostic
            </button>
          </div>

          {/* Info banner for session issues */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="space-y-2">
              <p className="text-sm text-amber-900 dark:text-amber-200 font-semibold">
                🔑 Lỗi "Invalid JWT" hoặc redirect loop?
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Hãy thử: (1) <strong>Đăng ký tài khoản MỚI</strong> để test với dữ liệu mẫu tự động, hoặc (2) Bấm nút bên dưới để xóa session cũ.
              </p>
              <button
                type="button"
                onClick={async () => {
                  console.log('[Login] Manual clear auth triggered');
                  const { forceSignOut } = await import('../../lib/supabase');
                  await forceSignOut();
                  toast.success('Đã xóa session cũ! Hãy thử đăng nhập lại.');
                }}
                className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-medium"
              >
                → Xóa session cũ và thử lại
              </button>
            </div>
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

          {/* Demo Mode Button */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-50 dark:bg-gray-900 text-gray-500">hoặc</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleDemoMode}
            className="w-full h-12 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-900/30 dark:hover:to-yellow-900/30 text-amber-900 dark:text-amber-400 font-semibold shadow-sm transition-all duration-200"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Thử Demo Mode
          </Button>
        </div>
      </div>
    </div>
  );
}