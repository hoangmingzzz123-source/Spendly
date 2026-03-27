# Huong dan cau hinh bien moi truong - Spendly

## Tong quan kien truc

```
Frontend (React + Vite)          Backend (Supabase Edge Function)
  |                                |
  | VITE_SUPABASE_URL              | SUPABASE_URL
  | VITE_SUPABASE_ANON_KEY         | SUPABASE_ANON_KEY
  |                                | SUPABASE_SERVICE_ROLE_KEY
  |                                | GEMINI_API_KEY
  |                                |
  +------> fetch() --------------->+------> Supabase DB (kv_store)
                                   +------> Gemini API (AI Chat + OCR)
```

**Frontend** chi can 2 bien (public, an toan de expose).
**Backend** can 4 bien (trong do 2 bien la secret, KHONG duoc lo ra frontend).

---

## 1. Lay thong tin tu Supabase

### Buoc 1: Tao project Supabase (neu chua co)

1. Truy cap [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Chon Organization, dat ten project (vd: `spendly`), chon region gan nhat (vd: `Southeast Asia - Singapore`)
4. Dat **Database Password** - luu lai de dung sau
5. Doi 1-2 phut de project khoi tao xong

### Buoc 2: Lay cac key

Vao **Project Settings > API** (thanh ben trai chon bieu tuong banh rang):

| Truong | Bien moi truong | Vi tri |
|--------|-----------------|--------|
| **Project URL** | `SUPABASE_URL` | API Settings > Project URL |
| **anon public** | `SUPABASE_ANON_KEY` | API Settings > Project API keys > anon public |
| **service_role secret** | `SUPABASE_SERVICE_ROLE_KEY` | API Settings > Project API keys > service_role (click "Reveal") |

> **CANH BAO**: `SUPABASE_SERVICE_ROLE_KEY` co quyen FULL ACCESS vao database. TUYET DOI KHONG dat vao frontend code, Git, hay bat ky noi nao public.

### Buoc 3: Lay Database URL (tuy chon)

Vao **Project Settings > Database > Connection string > URI**:

```
SUPABASE_DB_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

---

## 2. Lay Gemini API Key (MIEN PHI)

1. Truy cap [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Dang nhap tai khoan Google
3. Click **"Create API Key"**
4. Chon mot Google Cloud project (hoac tao moi)
5. Copy API key

**Free tier cua Gemini:**
- 15 requests/phut
- 1 trieu tokens/ngay
- 1,500 requests/ngay
- Du cho ung dung ca nhan

**Spendly su dung:**
- `gemini-2.0-flash` - cho AI Chat (query trung binh) va OCR Scanner
- `gemini-1.5-pro` - cho cau hoi phuc tap (tu van tai chinh chi tiet)

---

## 3. Cau hinh Local Development

### Buoc 1: Tao file `.env` o root project

```bash
cp .env.example .env
```

Hoac tao thu cong file `.env`:

```env
# ============================================
# SUPABASE - Frontend (public, an toan)
# ============================================
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# SUPABASE - Backend (SECRET - khong commit!)
# ============================================
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# ============================================
# AI - Google Gemini (MIEN PHI)
# ============================================
GEMINI_API_KEY=AIzaSy...your-gemini-key
```

### Buoc 2: Dam bao `.env` nam trong `.gitignore`

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

### Buoc 3: Cau hinh Supabase Edge Functions local

```bash
# Cai Supabase CLI
brew install supabase/tap/supabase
# hoac
npm install -g supabase

# Dang nhap
supabase login

# Link voi project
supabase link --project-ref your-project-ref

# Dat secrets cho Edge Functions
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJhbGci...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
supabase secrets set GEMINI_API_KEY=AIzaSy...

# Xac nhan da dat thanh cong
supabase secrets list
```

### Buoc 4: Chay local

```bash
# Terminal 1 - Chay Edge Functions
supabase functions serve server --env-file .env

# Terminal 2 - Chay Frontend
pnpm dev
```

---

## 4. Cau hinh Vercel (Production)

### Buoc 1: Import project

1. Truy cap [https://vercel.com/new](https://vercel.com/new)
2. Import repository tu GitHub/GitLab
3. Cau hinh:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

### Buoc 2: Dat Environment Variables tren Vercel

Vao **Project Settings > Environment Variables**, them tung bien:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-ref.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` (anon key) | Production, Preview, Development |

> **Luu y**: Vercel chi can 2 bien `VITE_*` cho frontend. Backend chay tren Supabase Edge Functions, khong phai tren Vercel.

### Buoc 3: Dat Supabase Edge Function Secrets

Backend (Supabase Edge Functions) can duoc cau hinh rieng:

```bash
# Dat tat ca secrets mot luc
supabase secrets set \
  SUPABASE_URL=https://your-ref.supabase.co \
  SUPABASE_ANON_KEY=eyJhbGci... \
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... \
  GEMINI_API_KEY=AIzaSy...

# Kiem tra
supabase secrets list
```

Hoac dung Supabase Dashboard:
1. Vao [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Chon project > **Edge Functions** > **Manage secrets**
3. Them tung secret

### Buoc 4: Deploy Edge Functions

```bash
# Deploy function "server"
supabase functions deploy server

# Kiem tra log
supabase functions logs server --tail
```

### Buoc 5: Deploy frontend tren Vercel

```bash
# Option A: Tu dong deploy khi push code
git push origin main

# Option B: Deploy thu cong
vercel --prod
```

---

## 5. Bang tom tat bien moi truong

### Frontend (Vercel / Vite)

| Bien | Bat buoc | Mo ta | Vi tri lay |
|------|----------|-------|-----------|
| `VITE_SUPABASE_URL` | Co | URL cua Supabase project | Supabase > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Co | Public anon key (an toan) | Supabase > Settings > API |

### Backend (Supabase Edge Functions)

| Bien | Bat buoc | Mo ta | Vi tri lay |
|------|----------|-------|-----------|
| `SUPABASE_URL` | Co | URL cua Supabase project | Supabase > Settings > API |
| `SUPABASE_ANON_KEY` | Co | Public anon key, dung cho login flow | Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Co | Secret admin key, toan quyen | Supabase > Settings > API (Reveal) |
| `SUPABASE_DB_URL` | Khong | Direct DB connection | Supabase > Settings > Database |
| `GEMINI_API_KEY` | Co* | Google AI Studio API key | aistudio.google.com/apikey |

> *`GEMINI_API_KEY` bat buoc neu muon dung AI Chat va OCR Scanner. Neu khong co, cac tinh nang nay se tra ve loi.

---

## 6. Xu ly loi thuong gap

### Loi: "Invalid API key" khi goi Supabase

```
Nguyen nhan: SUPABASE_URL hoac SUPABASE_ANON_KEY sai
Cach fix:
1. Kiem tra lai key trong Supabase Dashboard > Settings > API
2. Dam bao KHONG co dau cach thua hoac xuong dong trong key
3. Restart server sau khi doi key
```

### Loi: "Unauthorized" khi dang nhap

```
Nguyen nhan: SUPABASE_ANON_KEY trong Edge Function khong khop
Cach fix:
1. supabase secrets set SUPABASE_ANON_KEY=<correct-key>
2. supabase functions deploy server
```

### Loi: "Gemini API error" hoac "GEMINI_API_KEY not configured"

```
Nguyen nhan: Chua dat GEMINI_API_KEY hoac key het han
Cach fix:
1. Vao aistudio.google.com/apikey kiem tra key con hoat dong
2. supabase secrets set GEMINI_API_KEY=<new-key>
3. supabase functions deploy server
```

### Loi: "Function not found" hoac 404

```
Nguyen nhan: Chua deploy Edge Function
Cach fix:
1. supabase functions deploy server
2. Kiem tra URL: https://<project-ref>.supabase.co/functions/v1/make-server-f5f5b39c/
```

### Loi: CORS error tren frontend

```
Nguyen nhan: Frontend URL khong duoc phep trong CORS config
Cach fix: Server da cau hinh origin: '*', nen loi nay thuong do:
1. URL API sai - kiem tra VITE_SUPABASE_URL
2. Edge Function chua deploy - chay supabase functions deploy server
```

### Loi: "Rate limit exceeded" tu Gemini

```
Nguyen nhan: Vuot qua 15 requests/phut (free tier)
Cach fix:
1. Doi 1 phut roi thu lai
2. AI Router da co cache de giam so luong request
3. Nang cap len Google AI paid plan neu can
```

---

## 7. Kiem tra sau khi cau hinh

Chay cac lenh sau de xac nhan moi thu hoat dong:

```bash
# 1. Test Supabase connection
curl https://your-ref.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# 2. Test Edge Function
curl https://your-ref.supabase.co/functions/v1/make-server-f5f5b39c/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email":"test@test.com","password":"123456"}'

# 3. Test Gemini API
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_GEMINI_KEY" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

Tat ca 3 lenh tra ve response hop le (khong phai 401/403/404) la thanh cong.

---

## 8. Bao mat

- KHONG BAO GIO commit `.env` vao Git
- KHONG BAO GIO dat `SUPABASE_SERVICE_ROLE_KEY` vao frontend code
- Chi dung `VITE_*` prefix cho cac bien an toan (public key)
- Rotate key dinh ky: Supabase > Settings > API > Regenerate
- Kiem tra Supabase Logs thuong xuyen de phat hien truy cap bat thuong
