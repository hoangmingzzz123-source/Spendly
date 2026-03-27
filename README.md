# 💰 Spendly - Ứng Dụng Quản Lý Tài Chính Cá Nhân

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB.svg" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg" alt="Tailwind">
</div>

## 📋 Giới thiệu

**Spendly** là ứng dụng quản lý tài chính cá nhân toàn diện, giúp bạn theo dõi thu chi, đặt ngân sách, tiết kiệm thông minh và phân tích tài chính với AI.

### ✨ Tính năng chính

#### 🎯 Core MVP Features
- ✅ **Xác thực người dùng** - Email/Password login & registration
- ✅ **Quản lý tài khoản** - Ngân hàng, tiền mặt, thẻ tín dụng
- ✅ **Phân loại danh mục** - Cấu trúc phân cấp, custom categories
- ✅ **Nhập giao dịch** - Thủ công với form đầy đủ
- ✅ **Dashboard tổng quan** - Thu/chi, biểu đồ, top categories
- ✅ **Timeline** - Story-like feed theo ngày
- ✅ **Calendar View** - Xem theo ngày/tháng/năm

#### 🚀 Phase 2 Features
- ✅ **Quản lý Ngân sách** - Theo danh mục & tháng, cảnh báo vượt quá
- ✅ **Mục tiêu Tiết kiệm** - Progress tracking, deadline reminders
- ✅ **Nhắc nhở Thông minh** - Thanh toán định kỳ, ghi thu nhập
- ✅ **Chia sẻ Gia đình** - Tạo nhóm, mời thành viên
- ✅ **AI Chatbot** - Phân tích & tư vấn tài chính
- ✅ **Dark Mode** - Light/Dark/System theme
- ✅ **Export Data** - Xuất Excel, báo cáo thuế

#### 🔥 Advanced Features
- ✅ **Analytics Dashboard** - Financial health score, insights
- ✅ **Notifications Center** - Cảnh báo ngân sách, mục tiêu, nhắc nhở
- ✅ **Advanced Charts** - Area charts, pie charts, bar charts
- ✅ **Multi-language** - Tiếng Việt & English
- ✅ **Responsive Design** - Mobile/Tablet/Desktop
- ✅ **OCR Bill Scanning** - Quét hóa đơn tự động bằng camera
- ✅ **PWA Support** - Cài đặt app, sử dụng offline
- ✅ **Real AI Integration** - Tích hợp Grok/OpenAI API

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **React Router 7** - Routing với Data mode
- **TanStack Query v5** - Server state management
- **Zustand** - Client state management
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Edge Functions (Deno/Hono)
  - Storage (for future features)
- **Hono** - Web framework cho Edge Functions

## 📁 Cấu trúc dự án

```
spendly/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Accounts.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── Budgets.tsx      # Phase 2
│   │   │   ├── Goals.tsx        # Phase 2
│   │   │   ├── Reminders.tsx    # Phase 2
│   │   │   ├── Family.tsx       # Phase 2
│   │   │   ├── AIChat.tsx       # Phase 2
│   │   │   ├── Analytics.tsx    # Advanced
│   │   │   ├── Notifications.tsx # Advanced
│   │   │   ├── Settings.tsx     # Phase 2
│   │   │   └── Root.tsx
│   │   ├── routes.tsx
│   │   └── App.tsx
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   ├── store.ts             # Zustand store
│   │   └── supabase.ts          # Supabase client
│   └── styles/
│       ├── index.css
│       ├── theme.css
│       └── fonts.css
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx         # Main API server
│           └── kv_store.tsx      # KV storage utils
└── package.json
```

## 🎨 Tính năng nổi bật

### 1. Dashboard Intelligence
- **Tỷ lệ tiết kiệm** tự động tính toán
- **Xu hướng 6 tháng** với area charts
- **Phân tích chi tiêu** theo danh mục
- **Quick actions** để truy cập nhanh

### 2. AI-Powered Insights
- Phân tích thói quen chi tiêu
- Đề xuất tiết kiệm
- Cảnh báo vượt ngân sách
- Financial health score

### 3. Smart Notifications
- Tự động phát hiện vượt ngân sách
- Nhắc nhở sắp đạt mục tiêu
- Cảnh báo deadline
- Nhắc nhở thanh toán định kỳ

### 4. Beautiful UI/UX
- Gradient cards cho stats
- Animated progress bars
- Responsive mobile navigation
- Dark mode hỗ trợ đầy đủ
- Smooth transitions

## 🔐 API Endpoints

### Authentication
```
POST /auth/register    - Đăng ký tài khoản
POST /auth/login       - Đăng nhập
```

### Core Features
```
GET  /accounts         - Lấy danh sách tài khoản
POST /accounts         - Tạo tài khoản mới
GET  /categories       - Lấy danh mục
POST /categories       - Tạo danh mục custom
GET  /transactions     - Lấy giao dịch (with filters)
POST /transactions     - Tạo giao dịch mới
DELETE /transactions/:id - Xóa giao dịch
GET  /dashboard/summary - Tổng quan tài chính
GET  /timeline         - Timeline feed
```

### Phase 2 Features
```
GET  /budgets          - Lấy ngân sách
POST /budgets          - Tạo ngân sách
GET  /goals            - Lấy mục tiêu tiết kiệm
POST /goals            - Tạo mục tiêu
POST /goals/:id/allocate - Cộng tiền vào mục tiêu
GET  /reminders        - Lấy nhắc nhở
POST /reminders        - Tạo nhắc nhở
GET  /family/group     - Lấy nhóm gia đình
POST /family/groups    - Tạo nhóm gia đình
POST /family/invite    - Mời thành viên
GET  /export/excel     - Xuất dữ liệu
POST /chat             - AI Chat
```

## 📊 Data Model

### Core Entities
- **Users** - Thông tin người dùng
- **Accounts** - Tài khoản (Bank, Cash, Credit)
- **Categories** - Danh mục thu/chi (hierarchical)
- **Transactions** - Giao dịch

### Phase 2 Entities
- **Budgets** - Ngân sách theo category & tháng
- **Goals** - Mục tiêu tiết kiệm
- **Reminders** - Nhắc nhở định kỳ
- **Family Groups** - Nhóm chia sẻ gia đình

## 🔮 Future Roadmap

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

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Supabase account

### Installation

1. Clone repository
```bash
git clone <repository-url>
cd spendly
```

2. Install dependencies
```bash
pnpm install
```

3. Setup Supabase
- Create a Supabase project
- Get your project URL and anon key
- Update `/utils/supabase/info.tsx`

4. Run development server
```bash
pnpm dev
```

5. Open http://localhost:5173

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Danger**: Red (#EF4444)
- **Info**: Purple (#8B5CF6)

### Typography
- **Font Family**: System fonts
- **Heading**: Bold, 24-48px
- **Body**: Regular, 14-16px
- **Small**: 12px

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- **Lead Developer** - Full-stack development
- **UI/UX Designer** - Design system & components
- **Business Analyst** - Requirements & features

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Recharts](https://recharts.org/) - Charting library
- [Supabase](https://supabase.com/) - Backend platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

<div align="center">
  Made with ❤️ by Spendly Team
  <br/>
  <strong>Quản lý tài chính thông minh hơn</strong>
</div>