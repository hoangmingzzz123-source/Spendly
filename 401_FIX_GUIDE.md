# Fix lỗi 401 Unauthorized khi call API

## Nguyên nhân

Lỗi 401 Unauthorized xảy ra vì:

1. **Frontend đang gửi publicAnonKey thay vì access_token**: 
   - `publicAnonKey` là key công khai của Supabase dùng để khởi tạo client
   - `access_token` là token xác thực người dùng sau khi login
   - Backend cố verify `publicAnonKey` như là `access_token` → ❌ FAIL

2. **User chưa đăng nhập hoặc token hết hạn**:
   - Tất cả các API routes (trừ `/auth/login` và `/auth/register`) đều cần authentication
   - Nếu không có access_token hợp lệ → 401

## Đã Fix

### 1. Frontend (`/src/lib/supabase.ts`)
✅ **Trước đây**:
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`, // ❌ SAI
}
```

✅ **Bây giờ**:
```typescript
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
};

// Only send Authorization header if we have a real access token
// Do NOT send publicAnonKey as Bearer token
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### 2. Backend (`/supabase/functions/server/index.tsx`)
✅ Thêm debug logging chi tiết trong hàm `getUserId()`:
- Log khi không có Authorization header
- Log token length và prefix
- Log lỗi từ `supabase.auth.getUser()`
- Giúp debug dễ dàng hơn khi có vấn đề

### 3. Page Title
✅ Tạo file `/index.html` với title:
```html
<title>Spendly - Quản lý tài chính cá nhân thông minh</title>
```

## Cách test

### 1. Đăng nhập lại
- Truy cập `/login`
- Đăng nhập với tài khoản đã tạo
- Access token sẽ được lưu vào `localStorage`
- Các API calls sẽ gửi token đúng

### 2. Kiểm tra localStorage
Mở DevTools Console và chạy:
```javascript
localStorage.getItem('access_token')
```
- Nếu có token → OK ✅
- Nếu null → Cần login lại ❌

### 3. Kiểm tra Network tab
- Mở DevTools → Network
- Call một API (ví dụ: load dashboard)
- Xem Request Headers:
  - ✅ Có: `Authorization: Bearer eyJhbG...` (JWT token dài)
  - ❌ Không có Authorization header → Cần login
  - ❌ Có: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oenNzb2lzaHBpcGl5cHd1dXB4Iiwicm9sZSI6ImFub24i...` → Đây là publicAnonKey, SAI!

### 4. Xem Supabase Edge Function logs
- Truy cập Supabase Dashboard → Edge Functions → Logs
- Tìm `[AUTH DEBUG]` logs:
  - `Authorization header present: true` → OK
  - `Token length: XXX` → OK (JWT token thường > 500 chars)
  - `getUser error: ...` → Lỗi verify token (có thể expired hoặc invalid)
  - `User authenticated: xxx-xxx-xxx` → ✅ SUCCESS

## Lưu ý quan trọng

### Vercel Environment Variables
Trong `vercel.json`, bạn có:
```json
"env": {
  "VITE_SUPABASE_URL": "@supabase-url",
  "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
}
```

⚠️ **Những biến này CHỈ dùng cho frontend** để khởi tạo Supabase client, **KHÔNG dùng để gửi trong Authorization header**.

### Edge Function Environment Variables
Backend cần các biến sau (đã có trong Supabase Secrets):
- `SUPABASE_URL` - URL của Supabase project
- `SUPABASE_ANON_KEY` - Anon key (dùng trong login route)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (dùng để verify tokens)
- `GEMINI_API_KEY` - API key cho Google AI Studio

✅ Các biến này đã được set đúng trong Supabase Dashboard → Settings → Edge Function Secrets.

## Troubleshooting

### Vẫn bị 401 sau khi login?
1. Xóa localStorage và login lại:
   ```javascript
   localStorage.clear()
   ```
2. Check edge function logs xem có lỗi `getUser error` không
3. Verify SUPABASE_SERVICE_ROLE_KEY được set đúng trong Supabase Secrets

### Token expired?
- Supabase access tokens mặc định expire sau 1 giờ
- Frontend cần implement refresh token logic (hiện tại chưa có)
- Giải pháp tạm: Logout và login lại

### Không gọi được API sau deploy lên Vercel?
1. Check VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong Vercel env vars
2. Đảm bảo build thành công
3. Check browser console có lỗi CORS không
4. Verify edge function đang chạy (gọi `/health` endpoint)

## Kết luận

✅ Đã fix xong lỗi 401 bằng cách:
1. **Không gửi publicAnonKey trong Authorization header**
2. **Chỉ gửi Bearer token khi có access_token thật**
3. **Thêm logging chi tiết để debug**

🎯 User cần **đăng nhập** để sử dụng app. Sau khi login, access_token sẽ được lưu trong localStorage và tự động gửi trong mọi API request.
