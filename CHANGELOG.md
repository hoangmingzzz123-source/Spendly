# Changelog

Tất cả các thay đổi quan trọng của dự án Spendly sẽ được ghi lại trong file này.

## [1.0.0] - 2026-03-26

### 🎉 Initial Release - Full MVP + Phase 2

#### ✨ Core Features (MVP)
- **Authentication System**
  - Email/Password registration và login
  - Session management với Supabase Auth
  - Protected routes và auto-redirect
  
- **Account Management**
  - Tạo và quản lý nhiều tài khoản (Bank, Cash, Credit)
  - Theo dõi số dư real-time
  - Custom icons và colors
  
- **Category System**
  - Hierarchical categories (parent-child)
  - Pre-built default categories (Thu/Chi)
  - Custom category creation
  - Icon và color customization
  
- **Transaction Management**
  - Nhập giao dịch thủ công đầy đủ
  - Filter theo date range, category
  - Delete transactions với balance update
  - Notes và tags support
  
- **Dashboard**
  - Tổng quan tài chính tháng hiện tại
  - 4 stat cards: Total Assets, Income, Expense, Balance
  - Pie chart phân bổ chi tiêu top 5
  - Category breakdown chi tiết
  
- **Timeline View**
  - Story-like feed theo ngày
  - Group transactions by date
  - Category pills và amounts
  - Responsive mobile layout
  
- **Calendar View**
  - Monthly calendar với transactions
  - Daily transaction list
  - Quick navigation giữa các tháng

#### 🚀 Phase 2 Features

- **Budget Management**
  - Tạo ngân sách theo category & tháng
  - Auto-calculate spent vs budget
  - Progress bars với color indicators
  - Alert khi vượt 90% và 100%
  
- **Savings Goals**
  - Đặt mục tiêu tiết kiệm với target amount
  - Deadline tracking (optional)
  - Custom icons và colors
  - Allocate money với progress tracking
  - Completion notifications
  
- **Smart Reminders**
  - 3 types: Daily, Bill Payment, Income
  - Frequency options: Daily, Weekly, Monthly
  - Enable/disable individual reminders
  - Time scheduling
  
- **Family Sharing**
  - Tạo family groups
  - Invite members via email
  - Member management
  - Owner permissions
  
- **AI Chatbot**
  - Conversational interface
  - RAG-based context (transactions, budgets, goals)
  - Quick questions suggestions
  - Mock AI responses (ready for GPT/Grok integration)
  
- **Dark Mode**
  - 3 options: Light, Dark, System
  - Persistent theme preference
  - Smooth transitions
  - Full app coverage
  
- **Data Export**
  - Export transactions to Excel
  - Tax report generation
  - Year-based filtering

#### 🔥 Advanced Features

- **Analytics Dashboard**
  - Financial Health Score (0-100)
  - AI-generated insights
  - 6-month trend analysis (Area charts)
  - Budget vs Actual comparison
  - Spending patterns detection
  - Quick stats grid
  
- **Notifications Center**
  - Auto-generated notifications
  - Budget alerts (90%, 100%)
  - Goal progress notifications
  - Deadline warnings
  - Reminder notifications
  - Read/unread status
  - Dismiss functionality
  
- **Enhanced Dashboard**
  - Gradient stat cards
  - Savings rate calculation
  - 6-month trend area charts
  - Category breakdown với progress bars
  - Accounts overview
  - Quick action buttons
  
- **Help Center**
  - Comprehensive FAQ
  - 8 sections với 24+ questions
  - Accordion UI
  - Quick links navigation
  - Contact support info

- **OCR Bill Scanning** ✨ NEW
  - Camera capture support
  - Automatic data extraction (amount, date, merchant)
  - AI-powered recognition
  - Confidence score display
  - Quick transaction creation
  - Supports JPG, PNG, HEIC (max 10MB)
  - Mock implementation (ready for real OCR service)

- **PWA Support** ✨ NEW
  - Progressive Web App manifest
  - Service Worker with caching
  - Install prompt component
  - Offline functionality
  - Background sync for transactions
  - Push notifications support
  - App shortcuts (Dashboard, Transactions, OCR)
  - Mobile-first design

- **Real AI Integration** ✨ NEW
  - OpenAI/Grok API compatibility
  - RAG-based context retrieval
  - Fallback to mock responses
  - Environment variable configuration
  - Smart error handling
  - Financial analysis and advice

#### 🎨 UI/UX Improvements

- **Design System**
  - Consistent gradient cards
  - Beautiful color palette
  - Smooth animations
  - Responsive layouts
  - Touch-friendly buttons
  
- **Navigation**
  - 15 menu items
  - Desktop sidebar
  - Mobile hamburger menu
  - Bottom navigation bar (mobile)
  - Active state indicators
  
- **Components**
  - shadcn/ui components
  - Custom styled cards
  - Progress bars
  - Badges
  - Dialogs
  - Toast notifications
  
- **Charts & Visualizations**
  - Area charts (trends)
  - Pie charts (distribution)
  - Bar charts (comparison)
  - Line charts (patterns)
  - Responsive với Recharts

#### 🔧 Technical Stack

**Frontend:**
- React 18.3.1
- React Router 7 (Data mode)
- TanStack Query v5
- Zustand (state management)
- Tailwind CSS v4
- shadcn/ui
- Recharts
- Lucide icons
- Sonner (toasts)

**Backend:**
- Supabase (PostgreSQL)
- Supabase Auth
- Edge Functions (Deno + Hono)
- KV Store

**Dev Tools:**
- TypeScript
- Vite
- pnpm

#### 📊 Statistics

- **Total Components:** 20+ pages
- **Total Routes:** 17 routes
- **API Endpoints:** 35+ endpoints
- **Lines of Code:** ~15,000+
- **Features:** 50+ features

#### 🐛 Bug Fixes

- Fixed localStorage safety checks
- Fixed import paths
- Fixed runtime errors
- Fixed theme application
- Fixed responsive layouts
- Fixed mobile navigation

#### 📝 Documentation

- README.md với full documentation
- CHANGELOG.md tracking
- Help Center in-app
- Code comments
- Type definitions

### 🔮 Future Roadmap

**v1.1.0 (Planned)**
- OCR bill scanning
- Real AI integration (GPT-4/Grok)
- PWA support
- Push notifications

**v1.2.0 (Planned)**
- Bank sync (VNPay, Momo)
- Multi-currency support
- Recurring transactions
- Social login (Google/Apple)

**v2.0.0 (Planned)**
- Investment tracking
- Budget templates
- Expense splitting
- Mobile apps (React Native)

---

## Version Format

Format: `[MAJOR.MINOR.PATCH]`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

## Legend

- ✨ New feature
- 🐛 Bug fix
- 🔧 Technical improvement
- 📝 Documentation
- 🎨 UI/UX improvement
- ⚡ Performance
- 🔒 Security
- ♻️ Refactor