# 📋 Spendly - Technical Documentation

## 🏗️ Kiến trúc hệ thống

### Three-tier Architecture
```
Frontend (React + TypeScript)
    ↓
API Layer (Supabase Edge Functions)
    ↓
Database (PostgreSQL via KV Store)
```

## 📁 Cấu trúc dự án

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Main app với QueryClient & Router
│   │   ├── routes.tsx                 # Router configuration
│   │   └── components/
│   │       ├── Login.tsx              # Đăng nhập
│   │       ├── Register.tsx           # Đăng ký
│   │       ├── Root.tsx               # Layout chính với navigation
│   │       ├── Dashboard.tsx          # Tổng quan tài chính
│   │       ├── Accounts.tsx           # Quản lý tài khoản
│   │       ├── Categories.tsx         # Quản lý danh mục
│   │       ├── Transactions.tsx       # Quản lý giao dịch
│   │       ├── Timeline.tsx           # Timeline story-like
│   │       ├── Calendar.tsx           # Lịch theo ngày/tháng/năm
│   │       ├── WelcomeDialog.tsx      # Dialog chào mừng
│   │       ├── NotFound.tsx           # 404 page
│   │       └── ui/                    # shadcn/ui components
│   │
│   ├── lib/
│   │   ├── api.ts                     # API client functions
│   │   ├── store.ts                   # Zustand store (global state)
│   │   └── supabase.ts                # Supabase client config
│   │
│   └── styles/
│       ├── theme.css                  # Color scheme & dark mode
│       ├── tailwind.css               # Tailwind imports
│       └── fonts.css                  # Font imports
│
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx              # Edge Functions server (Hono)
│           └── kv_store.tsx           # KV store utilities
│
└── README.md                          # User documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Đăng ký user mới
- `POST /auth/login` - Đăng nhập

### Accounts
- `GET /accounts` - Lấy danh sách tài khoản
- `POST /accounts` - Tạo tài khoản mới
- `GET /accounts/balance` - Lấy tổng số dư

### Categories
- `GET /categories` - Lấy danh sách danh mục
- `POST /categories` - Tạo danh mục mới

### Transactions
- `GET /transactions` - Lấy danh sách giao dịch (với filter)
- `POST /transactions` - Tạo giao dịch mới
- `GET /transactions/:id` - Lấy chi tiết giao dịch
- `DELETE /transactions/:id` - Xóa giao dịch

### Dashboard & Reports
- `GET /dashboard/summary` - Tổng quan tài chính
- `GET /timeline` - Timeline theo ngày

## 💾 Data Model

### Users
```typescript
{
  id: string
  email: string
  name: string
  created_at: timestamp
}
```

### Accounts
```typescript
{
  id: string
  userId: string
  name: string
  type: 'CASH' | 'BANK' | 'CREDIT' | 'INCOME_SOURCE'
  balance: number
  icon: string
  color: string
  createdAt: timestamp
}
```

### Categories
```typescript
{
  id: string
  userId: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  parentId: string | null  // For hierarchical categories
  icon: string
  color: string
  createdAt: timestamp
}
```

### Transactions
```typescript
{
  id: string
  userId: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
  accountId: string
  date: string  // YYYY-MM-DD
  note: string
  tags: string[]
  createdAt: timestamp
}
```

## 🎨 UI/UX Features

### Responsive Design
- **Desktop (≥1024px)**: Sidebar navigation, wide layout
- **Tablet (768px - 1023px)**: Optimized grid layouts
- **Mobile (<768px)**: Bottom navigation, touch-friendly

### Dark Mode
- Automatic detection via `next-themes`
- Manual toggle in sidebar
- Full support across all components

### Color Scheme
- **Primary**: Blue (#3B82F6) - Trust, stability
- **Success**: Green (#10B981) - Income, savings
- **Danger**: Red (#EF4444) - Expenses, warnings
- **Accent**: Purple (#8B5CF6) - Special features

### Animations
- Smooth transitions (200-300ms)
- Loading states with spinners
- Hover effects on interactive elements
- Toast notifications for user feedback

## 🔐 Security

### Authentication
- JWT tokens with Supabase Auth
- Access tokens stored in localStorage
- Auto-redirect to login if unauthenticated

### Authorization
- All API routes check user authentication
- Users can only access their own data
- Service role key never exposed to frontend

### Data Validation
- Frontend: React Hook Form validation
- Backend: Required field checks
- Type safety with TypeScript

## 📊 State Management

### Global State (Zustand)
- User profile
- Access token
- Current month filter

### Server State (TanStack Query)
- Accounts, Categories, Transactions
- Dashboard summary
- Timeline data
- Automatic caching (5min stale time)
- Optimistic updates

## 🚀 Performance Optimizations

1. **Code Splitting**: React.lazy for route components
2. **Query Caching**: 5-minute stale time for dashboard data
3. **Debouncing**: Input fields debounced where needed
4. **Lazy Loading**: Images lazy loaded
5. **Memoization**: React.memo for heavy components

## 🔄 Data Flow

### Creating a Transaction
```
User Input → Form Validation → API Call → Update DB
    ↓
Update Account Balance → Invalidate Queries → Refetch Data
    ↓
UI Updates (Dashboard, Timeline, Accounts)
```

## 🧪 Default Data

Khi user đăng ký, hệ thống tự động tạo:

### 3 Accounts
1. Tiền mặt (CASH)
2. Tài khoản ngân hàng (BANK)
3. Thẻ tín dụng (CREDIT)

### 5 Income Categories
1. Lương
2. Thưởng
3. Đầu tư
4. Quà tặng
5. Khác

### 7 Expense Categories
1. Ăn uống (+ 2 sub-categories)
2. Di chuyển (+ 2 sub-categories)
3. Nhà cửa
4. Giải trí
5. Sức khỏe
6. Mua sắm
7. Khác

## 📱 Mobile Features

- Touch-optimized buttons (min 44px)
- Bottom navigation for easy reach
- Pull-to-refresh (planned)
- Swipe gestures (planned)

## 🌐 Internationalization

- Primary: Vietnamese (vi-VN)
- Currency: VND (₫)
- Date format: dd/MM/yyyy
- Number format: Vietnamese locale

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Routing | React Router v7 |
| State | Zustand + TanStack Query |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Charts | Recharts |
| Forms | React Hook Form |
| Backend | Supabase Edge Functions (Hono) |
| Database | Supabase PostgreSQL (KV Store) |
| Auth | Supabase Auth |
| Build | Vite |

## 📈 Future Enhancements (Phase 2)

1. **AI Chatbot**: Gợi ý chi tiêu thông minh
2. **OCR**: Chụp ảnh hóa đơn tự động
3. **Budget**: Quản lý ngân sách theo category
4. **Goals**: Mục tiêu tiết kiệm
5. **Bank Sync**: Đồng bộ ngân hàng/e-wallet
6. **Family**: Chia sẻ tài khoản gia đình
7. **Tax Report**: Báo cáo thuế TNCN
8. **Reminders**: Nhắc nhở thanh toán

## 🐛 Known Limitations

1. No real-time collaboration (single user only)
2. No offline mode (requires internet)
3. No data export (planned for Phase 2)
4. No recurring transactions (planned for Phase 2)
5. Basic reporting (advanced reports in Phase 2)

## 🤝 Contributing

This is a prototype/demo application built with Figma Make.
For production use, consider:
- Adding comprehensive tests
- Implementing proper error boundaries
- Adding logging and monitoring
- Enhancing security measures
- Optimizing database queries
- Adding rate limiting

---

**Built with ❤️ using Figma Make**
