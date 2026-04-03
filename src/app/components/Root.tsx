import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router';
import { useStore } from '../../lib/store';
import { supabase, ensureSessionRestored, forceSignOut } from '../../lib/supabase';
import { queryClient } from '../App';
import { Button } from './ui/button';
import { WelcomeDialog } from './WelcomeDialog';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { 
  Home, 
  Wallet, 
  Tags, 
  ArrowLeftRight, 
  History, 
  Calendar as CalendarIcon,
  TrendingUp,
  Target,
  Bell,
  Users,
  Bot,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  BarChart3,
  Scan,
  ChevronRight,
  Receipt
} from 'lucide-react';

export function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, user, theme, setTheme, logout, setAccessToken, setUser, isDemo } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

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

  // On mount, restore Supabase session and sync token to Zustand
  useEffect(() => {
    const restoreSession = async () => {
      // Skip session restoration in demo mode
      if (isDemo) {
        console.log('[Root] Demo mode active - skipping session restoration');
        setIsInitializing(false);
        return;
      }
      
      console.log('[Root] Starting session restoration...');
      await ensureSessionRestored();
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Root] Session restoration error:', error);
          // Force clean logout if session is corrupted
          await forceSignOut();
          setIsInitializing(false);
          return;
        }
        
        if (session?.access_token) {
          // Verify token is actually valid by trying to get user
          const { data: { user: verifiedUser }, error: userError } = await supabase.auth.getUser(session.access_token);
          
          if (userError || !verifiedUser) {
            console.error('[Root] Token invalid, signing out:', userError?.message);
            // Token is invalid - force sign out and clear ALL storage
            await forceSignOut();
            setIsInitializing(false);
            return;
          }
          
          // Token is valid
          console.log('[Root] ✅ Session restored successfully for user:', verifiedUser.id);
          setAccessToken(session.access_token);
          
          // CRITICAL: Persist token to localStorage immediately
          try {
            localStorage.setItem('access_token', session.access_token);
            console.log('[Root] ✅ Token persisted to localStorage');
          } catch (err) {
            console.error('[Root] Failed to persist token:', err);
          }
          
          const u = verifiedUser;
          if (u) {
            setUser({ id: u.id, email: u.email ?? '', name: u.user_metadata?.name ?? '' });
          }
        } else {
          // No session at all - but don't immediately redirect, might be on /login or /register
          console.log('[Root] No session found on mount');
        }
      } catch (err) {
        console.error('[Root] Session restoration exception:', err);
        // Clean up on any error
        await forceSignOut();
      }
      setIsInitializing(false);
      console.log('[Root] ✅ Initialization complete');
    };
    restoreSession();
  }, []);

  // Sync Supabase session changes (auto token refresh, sign-out) with Zustand
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Root] Auth state changed:', event);
      if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') && session) {
        console.log(`[Root] ${event} - updating token in store`);
        setAccessToken(session.access_token);
        try { localStorage.setItem('access_token', session.access_token); } catch {}
        
        // Update user info on sign in
        if (event === 'SIGNED_IN' && session.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.user_metadata?.name ?? '',
          });
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[Root] SIGNED_OUT event - clearing store');
        logout();
      }
    });
    return () => subscription.unsubscribe();
  }, [setAccessToken, setUser, logout]);

  useEffect(() => {
    // Only redirect if:
    // 1. We're done initializing
    // 2. We truly have no token
    // 3. We're trying to access a protected route (not /login or /register)
    const isPublicRoute = location.pathname === '/login' || location.pathname === '/register';
    
    if (!isInitializing && !accessToken && !isPublicRoute) {
      console.log('[Root] ⚠️ No access token on protected route, redirecting to login');
      navigate('/login');
    }
  }, [accessToken, navigate, isInitializing, location.pathname]);

  const handleLogout = async () => {
    // Sign out from Supabase (clears their session storage)
    await supabase.auth.signOut();
    // Clear React Query cache
    queryClient.clear();
    // Clear Zustand store
    logout();
    // Navigate to login
    navigate('/login');
  };

  const navGroups = [
    {
      label: 'Chính',
      items: [
        { path: '/', label: 'Tổng quan', icon: Home },
        { path: '/transactions', label: 'Giao dịch', icon: ArrowLeftRight },
        { path: '/accounts', label: 'Tài khoản', icon: Wallet },
        { path: '/categories', label: 'Danh mục', icon: Tags },
      ],
    },
    {
      label: 'Phân tích',
      items: [
        { path: '/analytics', label: 'Phân tích', icon: BarChart3 },
        { path: '/timeline', label: 'Timeline', icon: History },
        { path: '/calendar', label: 'Lịch', icon: CalendarIcon },
      ],
    },
    {
      label: 'Kế hoạch',
      items: [
        { path: '/budgets', label: 'Ngân sách', icon: TrendingUp },
        { path: '/goals', label: 'Mục tiêu', icon: Target },
        { path: '/reminders', label: 'Nhắc nhở', icon: Bell },
      ],
    },
    {
      label: 'Tiện ích',
      items: [
        { path: '/bill-split', label: 'Chia bill', icon: Receipt },
        { path: '/chat', label: 'AI Chat', icon: Bot },
        { path: '/ocr', label: 'Quét bill', icon: Scan },
        { path: '/family', label: 'Gia đình', icon: Users },
        { path: '/settings', label: 'Cài đặt', icon: SettingsIcon },
      ],
    },
  ];

  const allNavItems = navGroups.flatMap((g) => g.items);
  const bottomNavItems = [
    allNavItems.find((i) => i.path === '/')!,
    allNavItems.find((i) => i.path === '/transactions')!,
    allNavItems.find((i) => i.path === '/chat')!,
    allNavItems.find((i) => i.path === '/analytics')!,
    allNavItems.find((i) => i.path === '/settings')!,
  ];

  // Show loading screen while initializing or if no access token
  if (isInitializing || !accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 dark:bg-gray-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto animate-pulse">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          {isInitializing && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Đang khởi tạo...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950">
      <WelcomeDialog />
      <PWAInstallPrompt />
      
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 z-40 ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-[260px]'
      }`}>
        {/* Sidebar background with glassmorphism */}
        <div className="flex flex-col flex-1 min-h-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/60 dark:border-gray-800/60">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-gray-100 dark:border-gray-800/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                    Spendly
                  </span>
                  {isDemo && (
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      Demo Mode
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin">
            {navGroups.map((group) => (
              <div key={group.label}>
                {!sidebarCollapsed && (
                  <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {group.label}
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                      >
                        <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${
                          isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                        }`} />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User section */}
          <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800/60 p-3">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              className={`w-full rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all ${
                sidebarCollapsed ? 'justify-center px-0' : 'justify-start'
              }`}
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              {!sidebarCollapsed && <span className="ml-2">Đăng xuất</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/25">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-none">
                  Spendly
                </span>
                {isDemo && (
                  <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide leading-none mt-0.5">
                    Demo Mode
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-x-0 top-14 bottom-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
              <nav className="p-4 space-y-6">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {group.label}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl ${
                              isActive
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
              <div className="border-t border-gray-100 dark:border-gray-800 p-4">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-xl" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main content */}
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[260px]'} pt-14 lg:pt-0`}>
        {/* Subtle background pattern */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/30 dark:bg-purple-900/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="min-h-screen pb-20 lg:pb-0">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-800/60">
          <nav className="flex justify-around py-1.5 px-2">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-xl min-w-[56px] transition-all ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}