**Tài liệu Phân tích & Thiết kế Nghiệp vụ Chi Tiết**  
**Dự án: Web/App Quản Lý Tài Chính Cá Nhân (Personal Finance Manager)**  
**Phiên bản:** 1.0 (MVP + Roadmap mở rộng)  
**Ngày:** 26/03/2026  
**Người soạn:** Senior Business Analyst  

Tài liệu này được thiết kế **rõ ràng, có cấu trúc, copy-paste trực tiếp** cho Agent Vibe Code (hoặc dev team) để triển khai ngay. Tôi phân tích **toàn diện** và thiết kế **nghiệp vụ chi tiết** theo đúng yêu cầu của bạn: nguồn thu nhập, nguồn chi, phân loại, chụp ảnh bill + OCR, chụp ảnh + note, lịch ngày/tháng/năm, AI Chatbot gợi ý chi tiêu, Story Timeline, và **responsive mượt mà trên mọi nền tảng (Web + Mobile + Tablet)**.

### 1. Tổng quan dự án & Mục tiêu kinh doanh

**Tên app gợi ý:** **Spendly** (hoặc **VitaFinance**, **MinhChi** – dễ brand ở VN).  

**Mục tiêu chính:**  
- Giúp người dùng cá nhân (freelancer, nhân viên văn phòng, gia đình) **kiểm soát dòng tiền**, giảm chi tiêu thừa, xây dựng thói quen tài chính lành mạnh.  
- **Tự động hóa 80% công việc nhập liệu** nhờ OCR + AI.  
- Cung cấp **insights thông minh** qua AI Chatbot và Story Timeline.  
- **Cross-platform**: 1 codebase chạy mượt trên Web, iOS, Android, Tablet (PWA + Responsive Design).  

**Lợi ích cho user:**  
- Tiết kiệm thời gian (chụp bill → tự động tạo giao dịch).  
- Hiểu rõ hành vi chi tiêu qua timeline “story-like”.  
- Nhận gợi ý cá nhân hóa (“Tháng này bạn tiêu quá 30% vào ăn uống, nên cắt giảm 15% để đạt mục tiêu tiết kiệm”).  
- An toàn, riêng tư (dữ liệu local-first + mã hóa).

**Scope MVP (Minimum Viable Product):**  
Chỉ tập trung 8 chức năng cốt lõi bạn yêu cầu + các module hỗ trợ cần thiết để app dùng được ngay.

### 2. Yêu cầu Chức năng Chi Tiết (Functional Requirements)

#### 2.1. Module Quản lý Người dùng (Auth & Profile)
- Register/Login (Email + Password, Google OAuth, Apple Sign-in).  
- Profile: Tên, ảnh đại diện, đơn vị tiền tệ mặc định (VND), ngôn ngữ (VN/EN).  
- Multi-device sync (Firebase/Supabase realtime).

#### 2.2. Nguồn Thu Nhập & Nguồn Chi (Accounts / Wallets)
- **Nguồn Thu Nhập (Income Sources):** Salary, Freelance, Investment, Gift, Other… (có thể custom).  
- **Nguồn Chi / Ví tiền (Expense Sources / Accounts):** Cash, Bank Account, Credit Card, E-wallet (Momo, ZaloPay, VNPay)…  
- Mỗi giao dịch **phải chọn Source** để tính balance realtime.  
- **Balance tracking:** Tổng tài sản = Tổng Income Sources - Tổng Expense Sources.

#### 2.3. Phân loại Thu/Chi (Categories)
- Hierarchical (2 cấp):  
  - **Income Categories:** Lương, Thưởng, Đầu tư…  
  - **Expense Categories:** Ăn uống (Quán ăn, Siêu thị), Di chuyển, Nhà cửa, Giải trí, Sức khỏe…  
- Default categories theo chuẩn VN + cho phép **user custom** (thêm/sửa/xóa).  
- Icon + màu sắc cho từng category (dễ nhận diện).

#### 2.4. Giao dịch (Transactions) – Core Feature
- **Thêm giao dịch thủ công:** Số tiền, loại (Income/Expense), Category, Source, Ngày, Ghi chú, Tags.  
- **Chụp ảnh Bill + OCR (tự động):**  
  - User chụp ảnh hóa đơn → OCR extract: Số tiền, Ngày, Merchant (cửa hàng), Items (nếu có).  
  - Xác nhận/edit trước khi lưu.  
  - Hỗ trợ ảnh mờ, góc nghiêng, tiếng Việt.  
- **Chụp ảnh + Note:**  
  - Chụp ảnh bất kỳ (biên lai, vé, screenshot chuyển khoản) + ghi chú voice-to-text hoặc text.  
  - Attachment lưu trong transaction.  
- **Recurring transactions:** Hàng tháng (lương, tiền nhà).  
- **Split transaction:** 1 bill chia nhiều category.

#### 2.5. Lịch quản lý theo Ngày/Tháng/Năm (Calendar View)
- **3 chế độ xem:** Day / Month / Year.  
- Hiển thị: Tổng thu/chi/ngày, biểu đồ cột, danh sách transaction.  
- Filter theo Category, Source, Tags.  
- Highlight ngày vượt ngân sách.

#### 2.6. Story Timeline (View chi tiêu dạng Story)
- Feed kiểu Instagram Stories / TikTok:  
  - Mỗi “story card” = 1 ngày hoặc 1 transaction lớn.  
  - Hiển thị: Ngày + Tổng chi tiêu ngày + Top 3 categories + Ảnh bill (nếu có).  
  - Scroll timeline mượt, có filter “This week / This month / Last 3 months”.  
  - Swipe để xem chi tiết transaction.

#### 2.7. AI Chatbot Gợi ý Chi Tiêu (Core Differentiator)
- **Tên chatbot:** “Vita AI” hoặc “Chi Tiêu AI”.  
- **Chức năng:**  
  - Hỏi đáp tự nhiên: “Tháng này tôi tiêu bao nhiêu ăn uống?” → trả lời ngay.  
  - **Gợi ý thông minh:** “Bạn đang vượt 25% ngân sách Ăn uống. Gợi ý: Giảm 3 bữa ăn ngoài/tuần → tiết kiệm ~1.2tr”.  
  - Dự báo: “Nếu giữ nhịp này, cuối năm bạn dư 45tr”.  
  - Cảnh báo: “Bạn sắp hết tiền mặt, chuyển sang thẻ tín dụng chưa?”  
  - Phân tích hành vi: “Bạn hay chi tiêu cuối tuần – có nên set budget riêng không?”  
- **Công nghệ:** OpenAI GPT-4o (hoặc Grok/Claude) + RAG (dữ liệu transaction của user).  
- Prompt system đã tối ưu (tôi sẽ cung cấp sẵn nếu cần).

#### 2.8. Dashboard Home
- Tổng tài sản hiện tại.  
- Thu/Chi tháng này (so sánh với tháng trước).  
- Biểu đồ tròn Top 5 categories.  
- Story Timeline preview (3 cards gần nhất).  
- Quick actions: + Thu, + Chi, Chụp bill, Chat AI.

#### 2.9. Báo cáo & Xuất dữ liệu (Reports)
- Báo cáo theo kỳ (Ngày/Tháng/Năm).  
- Export CSV/PDF/Excel.  
- Budget vs Actual (so sánh ngân sách).

### 3. Yêu cầu Phi Chức năng (Non-Functional)

| Tiêu chí              | Yêu cầu chi tiết                              |
|-----------------------|-----------------------------------------------|
| Responsive            | Hoàn hảo trên Mobile, Tablet, Desktop (Tailwind + Mobile-first) |
| Performance           | Load < 1.5s, scroll 60fps, PWA (offline mode) |
| Bảo mật               | JWT + Refresh token, AES-256 encrypt sensitive data, 2FA optional |
| Scalability           | Hỗ trợ 100k users đầu tiên (Supabase/Firebase) |
| Accessibility         | WCAG 2.1 AA, Dark mode |
| Ngôn ngữ              | Tiếng Việt mặc định + English |
| Offline               | Lưu transaction local → sync khi online |

**Gợi ý Tech Stack cho Vibe Code (dễ implement):**
- Frontend: Next.js 15 + Tailwind + shadcn/ui + TanStack Query + Recharts
- Mobile/PWA: Next.js PWA + Capacitor (nếu cần native camera)
- Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions) hoặc Node.js + Prisma
- OCR: Google Vision API hoặc Tesseract.js (client-side) + OpenAI Vision fallback
- AI Chatbot: OpenAI Assistants API hoặc Vercel AI SDK
- Storage: Supabase Storage (ảnh bill)

### 4. Mô hình Dữ liệu (Data Model – ER Diagram text)

```sql
Users
- id, email, name, currency, created_at

Accounts (Nguồn Thu/Chi)
- id, user_id, name, type (INCOME_SOURCE | EXPENSE_SOURCE | BANK | CASH | CREDIT), balance, icon, color

Categories
- id, user_id, name, type (INCOME | EXPENSE), parent_id (null = level 1), icon, color

Transactions
- id, user_id, account_id, category_id, amount, type (INCOME | EXPENSE), date, note, photo_url (bill), ocr_data (JSON), recurring_id, tags[]

Budgets
- id, user_id, category_id, period (MONTH), amount_limit, created_at

AI_Insights (cache)
- id, user_id, prompt, response, created_at
```

**Quan hệ chính:**
- User 1:N Accounts, Categories, Transactions, Budgets
- Transaction 1:1 Account + 1:1 Category

### 5. Business Process Flows (User Flow chính)

**Flow 1: Thêm Chi Tiêu Nhanh (Chụp Bill)**
1. Home → Nhấn “Chụp bill”  
2. Mở camera → Chụp → Tự động OCR (extract amount, merchant, date)  
3. Preview form (auto-fill) → User edit Category/Source/Note  
4. Lưu → Update balance realtime + Thêm vào Story Timeline  

**Flow 2: Story Timeline**
1. Home → Tab “Timeline”  
2. Hiển thị cards theo ngày giảm dần  
3. Click card → Chi tiết ngày (list transaction + tổng)  

**Flow 3: AI Chatbot**
1. Bottom bar → Icon AI  
2. Chat window (giữ lịch sử)  
3. User hỏi → System query DB transaction → GPT generate response có context  

**Flow 4: Calendar View**
1. Tab “Lịch” → Chọn Month/Year  
2. Click ngày → List transaction ngày đó  

### 6. UI/UX Design Guidelines (cho designer/dev)
- **Color scheme:** Xanh dương (tin cậy) + Xanh lá (tiết kiệm) + Đỏ (cảnh báo).  
- **Navigation:** Bottom tab (Home, Timeline, Calendar, Reports, AI) trên Mobile. Sidebar trên Desktop.  
- **Micro-interactions:** Animation mượt khi lưu transaction, confetti khi đạt budget.  
- **Accessibility:** Large touch targets, voice input cho note.

### 7. Roadmap & Ưu tiên Phát triển (cho Vibe Code)

**Phase 1 (MVP – 4-6 tuần):**  
Auth + Accounts + Categories + Transactions (manual + OCR) + Dashboard + Timeline + Calendar + Responsive PWA.

**Phase 2 (2-3 tuần):**  
AI Chatbot + Budgets + Reports + Offline sync.

**Phase 3 (tùy chọn):**  
Recurring, Goals, Bank sync (Plaid/VNPay API), Multi-user (family), Export advanced.

**✅ TÀI LIỆU PHÂN TÍCH & THIẾT KẾ NGHIỆP VỤ BỔ SUNG**  
**Dự án: Spendly – Personal Finance Manager**  
**Phiên bản:** 1.1 (MVP + Phase 2)  
**Ngày:** 26/03/2026  
**Người soạn:** Senior Business Analyst  

Dưới đây là **phân tích chi tiết + thiết kế nghiệp vụ đầy đủ** cho **7 tính năng bạn yêu cầu**. Tôi đã tích hợp mượt mà vào tài liệu cũ (các module Auth, Transaction, Dashboard, Timeline, AI Chatbot, Calendar vẫn giữ nguyên).  

Bạn chỉ cần **copy toàn bộ phần này** và **dán nối tiếp** vào tài liệu Phase 1 tôi gửi trước đó, rồi gửi cho Agent Vibe Code.

---

### 8. Tính năng Bổ Sung (Phase 2 – 3-4 tuần triển khai)

#### 8.1. Quản lý Ngân sách (Budget) theo Category & theo Tháng
**Mô tả nghiệp vụ:**  
Người dùng đặt giới hạn chi tiêu cho từng category theo từng tháng. App tự động theo dõi **Actual vs Budget**, cảnh báo realtime và đưa vào AI Chatbot gợi ý.

**Chức năng chi tiết:**
- Tạo Budget hàng tháng (hoặc lặp lại hàng tháng).
- Budget có thể đặt cho:
  - Toàn bộ category cha (ví dụ: Ăn uống = 5.000.000đ/tháng)
  - Hoặc category con (Quán ăn = 2.500.000đ, Siêu thị = 2.500.000đ)
- Hiển thị % sử dụng (progress bar + màu: xanh <70%, vàng 70-90%, đỏ >100%).
- Cảnh báo push notification khi đạt 80% và 100%.
- Rollover: Số dư budget tháng trước tự động chuyển sang tháng sau (tùy chọn bật/tắt).

**Data Model bổ sung:**
```sql
Budgets
- id, user_id, category_id, month_year (YYYY-MM), amount_limit (decimal), rollover_enabled (boolean)
```

**User Flow:**
1. Tab “Ngân sách” → Chọn tháng → + Budget
2. Chọn Category → Nhập số tiền → Lưu
3. Dashboard & Timeline tự động hiển thị “Budget remaining” cho category liên quan.

**UI:** Biểu đồ cột Actual vs Budget, filter theo tháng.

#### 8.2. Mục tiêu Tiết kiệm (Savings Goals) với Tiến độ Hình ảnh
**Mô tả:**  
Tạo các mục tiêu dài hạn (mua xe, mua nhà, du lịch, quỹ khẩn cấp…) với tiến độ trực quan (progress circle + hình ảnh minh họa).

**Chức năng chi tiết:**
- Tạo Goal: Tên, Số tiền mục tiêu, Ngày hoàn thành, Ảnh bìa (hoặc icon mặc định), Mô tả.
- Tự động allocate: Khi có transaction “Income” dư so với budget → hỏi user “Có muốn chuyển vào Goal X không?”
- Progress: % hoàn thành + số tiền còn thiếu + ngày còn lại.
- Milestone: Khi đạt 25%/50%/75% → gửi thông báo + confetti.
- Hoàn thành Goal → tự động chuyển tiền sang Account “Savings” hoặc “Emergency Fund”.

**Data Model bổ sung:**
```sql
SavingsGoals
- id, user_id, name, target_amount, current_amount, deadline, image_url, status (ACTIVE | COMPLETED | PAUSED)
GoalTransactions (link transaction vào goal)
- transaction_id, goal_id, allocated_amount
```

**UI:** Card lớn với ảnh bìa + progress circle lớn + “Add to Goal” button nhanh.

#### 8.3. Đồng bộ Ngân hàng Tự động (VNPay, Momo, Techcombank, Vietcombank…)
**Mô tả:**  
Tự động kéo giao dịch từ ngân hàng/e-wallet vào app (giảm 90% công việc nhập tay).

**Chức năng chi tiết:**
- Kết nối qua OAuth2 / Open Banking (nếu ngân hàng hỗ trợ) hoặc API chính thức.
- Danh sách ngân hàng hỗ trợ MVP: Techcombank, Vietcombank, BIDV, Momo, ZaloPay, VNPay.
- Tần suất sync: Mỗi 15 phút (background) hoặc realtime webhook.
- Tự động map: Merchant → Category (dùng AI), Amount, Date.
- User review & confirm trước khi lưu (để tránh nhầm).
- Transaction sync sẽ ghi rõ “Synced from Techcombank” + logo ngân hàng.

**Lưu ý kỹ thuật (cho dev):**  
- Sử dụng Plaid tương đương VN hoặc tích hợp trực tiếp API của từng ngân hàng (cần hợp tác hoặc dùng middleware như Finhay/ Momo Business API).  
- Fallback: Import CSV/Excel từ app ngân hàng.

**Data Model bổ sung:**
- Transactions thêm field: `source_bank` (string), `external_id` (string).

#### 8.4. Chia sẻ Tài khoản Gia đình (Family Sharing)
**Mô tả:**  
Cho phép tạo “Family Group” để cả vợ/chồng/con cùng quản lý chung một tài khoản.

**Chức năng chi tiết:**
- Tạo Family Group (Admin là người tạo).
- Mời thành viên qua email/số điện thoại (link mời).
- Role: Owner, Admin, Member (chỉ xem), Contributor (thêm transaction).
- Shared: Transactions, Budgets, Goals, Dashboard.
- Private: Mỗi thành viên vẫn có “Personal Wallet” riêng (không chia sẻ).
- Activity log: Ai thêm/xóa transaction nào.

**Data Model bổ sung:**
```sql
FamilyGroups
- id, name, owner_id, created_at

FamilyMembers
- group_id, user_id, role (OWNER | ADMIN | MEMBER | CONTRIBUTOR)
```

#### 8.5. Báo cáo Thuế & Xuất File Excel theo Mẫu Việt Nam
**Mô tả:**  
Tự động sinh báo cáo theo mẫu thuế Thu Nhập Cá Nhân (TNCN) Việt Nam.

**Chức năng chi tiết:**
- Báo cáo hàng quý / năm: Tổng thu nhập, các khoản khấu trừ (bảo hiểm, từ thiện…), thuế phải nộp.
- Xuất Excel theo mẫu chuẩn Tổng cục Thuế (cột: Ngày, Loại thu, Số tiền, Người nộp, Ghi chú…).
- Tích hợp mẫu file .xlsx có sẵn (template) để user chỉ cần điền thêm.
- AI hỗ trợ: “Bạn có 3 khoản thu nhập freelance chưa khai thuế, tổng 45tr, thuế ước tính 4.5tr”.

**UI:** Tab “Báo cáo” → Chọn kỳ → Nút “Xuất Excel Thuế TNCN”.

#### 8.6. Dark Mode + Theme Tùy Chỉnh
**Yêu cầu phi chức năng:**
- Dark mode tự động theo hệ thống (iOS/Android/Web).
- Light / Dark / Auto.
- Theme tùy chỉnh: User chọn màu chính (Accent Color) → áp dụng toàn app (10 theme mặc định + custom).
- Lưu preference per user.

**Tech:** Tailwind CSS + CSS Variables + next-themes (Next.js).

#### 8.7. Nhắc Nhở (Reminders)
**3 loại nhắc nhở chính:**
1. **Nhắc thanh toán hóa đơn định kỳ**  
   - Tạo Recurring Bill (Tiền nhà, Điện, Internet, Học phí…).  
   - Ngày nhắc trước 3 ngày, 1 ngày, và ngày đến hạn.  
   - Nút “Đã thanh toán” → tự tạo transaction Expense.

2. **Nhắc ghi thu nhập định kỳ**  
   - User chọn ngày trong tháng (ví dụ: ngày 5 hàng tháng).  
   - 9h sáng ngày đó → Popup fullscreen: “Hôm nay là ngày ghi lương/thu nhập tháng 3. Nhập ngay?”  
   - Form nhanh: Số tiền + Nguồn + Lưu (1 click).

3. **Nhắc ghi thu chi cuối ngày**  
   - 21h00 hàng ngày → Push notification: “Hôm nay bạn có 2 transaction chưa ghi. Ghi nhanh không?”  
   - Nhấn vào → mở sheet thêm transaction nhanh (hoặc voice input).

**Data Model bổ sung:**
```sql
Reminders
- id, user_id, type (BILL | INCOME | DAILY_LOG), title, description, cron_expression (hoặc day_of_month), enabled
```

**UI:** Tab “Nhắc nhở” để quản lý tất cả.

---

### 9. Cập nhật Data Model Tổng (tóm tắt bổ sung)
Đã thêm: Budgets, SavingsGoals, FamilyGroups, FamilyMembers, Reminders, GoalTransactions.

### 10. Cập nhật Roadmap (cho Vibe Code)

**Phase 1 (MVP – 4-6 tuần):** (giữ nguyên tài liệu cũ)  
Auth + Transaction (OCR) + Timeline + Calendar + Dashboard + AI Chatbot cơ bản.

**Phase 2 (3-4 tuần – BẮT ĐẦU NGAY):**  
- Budget + Savings Goals + Reminders  
- Family Sharing  
- Dark mode + Theme  
- Bank Sync (ưu tiên Momo & Techcombank trước)  
- Báo cáo thuế & Excel export

**Phase 3:** Bank sync đầy đủ + AI nâng cao.

