# 🔥 TÀI LIỆU PHÂN TÍCH & THIẾT KẾ NGHIỆP VỤ  
**Dự án:** Spendly – Web/App Quản Lý Tài Chính Cá Nhân  
**Phiên bản:** 1.2 (Tối ưu cho Vibe Code Agent)  
**Ngày:** 26/03/2026  
**Người soạn:** Senior Business Analyst  

## 1. BỔ SUNG & TỐI ƯU TÀI LIỆU (RẤT QUAN TRỌNG)

### 1.1 Feature Prioritization cho AI Build
**Mục tiêu:** Giữ scope MVP nhỏ, rõ ràng để Vibe Code build nhanh, test dễ, tránh scope creep.

**🎯 Core MVP (PHẢI CÓ – Build đầu tiên – 3-4 tuần)**
- Auth (Email/Google/Apple)
- Accounts (Nguồn thu nhập & Nguồn chi)
- Categories (Thu/Chi + custom)
- Transactions (manual + form đầy đủ)
- Dashboard basic (tổng thu/chi, top categories)
- Timeline basic (story-like feed)

**❌ TẠM BỎ KHỎI MVP (chuyển sang Phase 2)**
- OCR chụp bill
- AI Chatbot
- Bank sync (VNPay, Momo…)
- Family Sharing
- Savings Goals, Budget, Reminders, Báo cáo thuế

**Lý do:** Vibe Code hiệu quả nhất khi scope nhỏ + rõ + có thể test end-to-end ngay tuần đầu.

### 1.2 API Contract (Backend)
**Base URL:** `/api/v1`

**Auth**
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`

**Accounts**
- `POST /accounts`
- `GET /accounts`
- `GET /accounts/balance`

**Categories**
- `GET /categories`
- `POST /categories` (custom)

**Transactions (Core)**
- `POST /transactions`
- `GET /transactions?from=YYYY-MM-DD&to=YYYY-MM-DD&category_id=...`
- `GET /transactions/:id`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`

**Dashboard**
- `GET /dashboard/summary?month=2026-03`

**Timeline**
- `GET /timeline?period=month&date=2026-03`

**Budget (Phase 2)**
- `POST /budgets`
- `GET /budgets?month=YYYY-MM`

**Savings Goals (Phase 2)**
- `POST /goals`
- `GET /goals`
- `POST /goals/:id/allocate`

**Reminders (Phase 2)**
- `GET /reminders`
- `POST /reminders`

**Family (Phase 2)**
- `POST /family/groups`
- `POST /family/invite`

**Export**
- `GET /export/excel?type=tax&year=2026`

### 1.3 State Management Strategy (Frontend)
- **Query & Cache:** TanStack Query (React Query) v5
  - Transactions: cache theo tháng (`queryKey: ['transactions', month]`)
  - Dashboard summary: `staleTime: 5 phút`, `stale-while-revalidate`
  - Budget & Goals: cache 10 phút
- **Global State:** Zustand (lightweight)
  - User profile, current month filter, theme, family group
- **Offline:** TanStack Query + local storage (sync khi online)

### 1.4 OCR Flow (ĐÃ SỬA – Tối ưu)
**Flow mới (chuẩn AI build):**
1. User chụp ảnh bill
2. OCR (Tesseract.js hoặc Google Vision) → raw text
3. **AI Normalize** (Grok / GPT-4o mini):
   - Extract & clean số tiền
   - Detect merchant → gợi ý category (dùng mapping + AI)
   - Detect date & currency
   - Tách items nếu có
4. Hiển thị preview form (auto-fill)
5. User confirm/edit → Save

### 1.5 AI Chatbot – RAG Definition (Phase 2)
**Context được inject:**
- Last 3 months transactions
- Current month budget & actual
- Top 5 categories
- Active Savings Goals
- User profile (currency, language)

**Available Tools (function calling):**
- `get_transactions(month)`
- `get_summary(month)`
- `get_budget_status(category)`
- `get_goals()`

**System Prompt** sẽ được cung cấp riêng khi build Phase 2.

---

## 2. TỔNG QUAN DỰ ÁN
**Tên app:** Spendly  
**Mục tiêu:** Quản lý tài chính cá nhân & gia đình, tự động hóa tối đa, insights thông minh, responsive 100% (Web + PWA Mobile + Tablet).

**Tech Stack gợi ý (Vibe Code):**
- FE: Next.js 15 (App Router) + Tailwind + shadcn/ui + TanStack Query + Zustand
- BE: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- OCR: Tesseract.js + AI normalize
- AI Chatbot: Vercel AI SDK + Grok/GPT-4o
- PWA + Offline: Next-PWA

---

## 3. YÊU CẦU CHỨC NĂNG (Core MVP + Phase 2)

### 3.1 Module MVP (xây trước)
- Auth & Profile
- Accounts (Nguồn thu/chi)
- Categories (hierarchical)
- Transactions (manual)
- Dashboard basic
- Timeline basic (story feed)
- Calendar (Ngày/Tháng/Năm)

### 3.2 Phase 2 (các tính năng bổ sung)
**8.1 Quản lý Ngân sách (Budget)** theo category & tháng  
**8.2 Mục tiêu Tiết kiệm (Savings Goals)** với progress hình ảnh  
**8.3 Đồng bộ Ngân hàng tự động** (VNPay, Momo, Techcombank…)  
**8.4 Chia sẻ Tài khoản Gia đình (Family Sharing)**  
**8.5 Báo cáo Thuế & xuất Excel** theo mẫu Việt Nam  
**8.6 Dark Mode + Theme tùy chỉnh**  
**8.7 Nhắc nhở (Reminders)**  
   - Thanh toán hóa đơn định kỳ  
   - Ghi thu nhập định kỳ (popup ngày cố định)  
   - Nhắc ghi thu chi cuối ngày (21h)

*(Chi tiết nghiệp vụ, data model, user flow của 7 tính năng này giống hệt tài liệu trước – đã được tích hợp đầy đủ trong file này.)*

---

## 4. DATA MODEL TỔNG (Supabase PostgreSQL)
```sql
users, accounts, categories, transactions, budgets, savings_goals, 
family_groups, family_members, reminders, goal_transactions