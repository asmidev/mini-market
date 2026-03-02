# 🛍️ Biznes Platform — Web + Telegram Mini App

Full-stack: **React** + **Node.js** + **PostgreSQL** + **Telegram Mini App** + **Telegram Bot**

---

## 📁 Loyiha Strukturasi

```
shopify-lite/
├── backend/
│   ├── config/db.js
│   ├── routes/
│   │   ├── products.js        # Public API
│   │   ├── admin.js           # Admin CRUD (JWT)
│   │   ├── categories.js
│   │   └── telegram.js        # TMA initData validatsiya
│   └── server.js
│
├── telegram-bot/              # 🤖 Alohida Telegram Bot servis
│   ├── bot.js                 # /start /shop /products /categories
│   └── package.json
│
└── frontend/
    └── src/
        ├── tma/               # 📱 Telegram Mini App
        │   ├── TMAApp.jsx     # 4 tab: Home/Products/Search/Profile
        │   ├── TMABottomNav.jsx
        │   ├── useTelegram.js # SDK hook
        │   └── tma.css
        ├── pages/             # Oddiy web sahifalar
        └── App.jsx            # /tma route qo'shilgan
```

---

## 🚀 O'rnatish

### 1. Telegram Bot olish (@BotFather)
```
/newbot → nom → username → TOKEN olasiz
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # to'ldiring (DB + Telegram)
mkdir -p uploads
npm install
npm run dev
```

### 3. Telegram Bot
```bash
cd telegram-bot
cp .env.example .env   # BOT_TOKEN va MINI_APP_URL
npm install
npm start
```

### 4. Frontend
```bash
cd frontend
npm install
npm start              # http://localhost:3000
```

TMA URL: `http://localhost:3000/tma` (development)
Production uchun: `https://yourdomain.com/tma` (HTTPS shart!)

---

## 🔧 BotFather — Mini App ulash

```
@BotFather → /mybots → Botingiz → Bot Settings → Menu Button
URL: https://yourdomain.com/tma
Text: 🛍️ Do'konni ochish
```

---

## 📱 TMA xususiyatlari

| | |
|---|---|
| 4 tab navigation | 🏠 Bosh / 📦 Mahsulotlar / 🔍 Qidiruv / 👤 Profil |
| Product Sheet | Full-screen slider, spring animation |
| MainButton | "Bog'lanish" — Telegram native tugma |
| HapticFeedback | Tap/selection/success vibration |
| Deep linking | `?product=ID` yoki `?category=slug` |
| User info | Telegram profil ma'lumotlari |
| initData validation | Server-side xavfsizlik tekshiruvi |

---

## 🤖 Bot buyruqlari

| Buyruq | |
|--------|---|
| `/start` | Xush kelibsiz + do'kon tugmasi |
| `/shop` | Mini App ochish |
| `/products` | Mahsulotlar (inline keyboard) |
| `/categories` | Kategoriyalar |
| `/featured` | Tanlangan mahsulotlar (rasm bilan) |

---

## 🔐 Admin Panel
- URL: `/admin`
- Login: `admin` / Parol: `admin123`
- ⚠️ Production uchun parolni o'zgartiring!

---

## .env fayllar

**backend/.env:**
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=biznes_db
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=secret_key
BASE_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
TELEGRAM_BOT_TOKEN=1234567890:ABC...
TELEGRAM_BOT_USERNAME=MyShopBot
MINI_APP_URL=https://yourdomain.com/tma
```

**telegram-bot/.env:**
```env
TELEGRAM_BOT_TOKEN=1234567890:ABC...
MINI_APP_URL=https://yourdomain.com/tma
API_URL=https://yourdomain.com
```

---

Made with ❤️ — React + Node.js + PostgreSQL + Telegram Mini App
