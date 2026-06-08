# 𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤 — FiveM MLO Store

## Product Requirements Document

---

## 1. Overview

A full-stack e-commerce platform for selling FiveM MLOs (maps, interiors, builds). Buyers browse, purchase, and download digital assets for their FiveM roleplay servers. Admins manage products, orders, users, coupons, theme, and Discord webhooks — all from a bilingual (Arabic/English) admin panel with dark/light mode.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 (Create React App), Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB via Mongoose |
| Auth | JWT + Passport.js (Discord OAuth2 + email/password) |
| Payments | Stripe |
| Email | SendGrid (via SMTP) |
| File Upload | Multer → Cloudinary |
| Deployment | Render (server + static client build) |
| Source | GitHub |

---

## 3. Architecture

```
┌──────────────┐     ┌──────────────────────┐     ┌──────────┐
│  React SPA   │────▶│  Express REST API    │────▶│ MongoDB  │
│  (client/)   │     │  (server/src/)       │     └──────────┘
└──────────────┘     └──────────────────────┘
       │                       │
       │                       ├── Discord Webhooks
       │                       ├── Stripe Payments
       │                       ├── SendGrid Email
       │                       └── Cloudinary Uploads
       │
  Tailwind CSS
  (Material 3 Cyber-Nexus)
```

- Server serves static React build from `client/build/` in production.
- All API routes prefixed with `/api/`.
- Catch-all `app.get('*')` serves `index.html` for client-side routing.

---

## 4. User Personas

### 4.1 Guest
- Browse shop, view products, see homepage
- Cannot purchase or access dashboard

### 4.2 Registered User
- Register via email or Discord OAuth
- Purchase products (Stripe checkout)
- View order history
- Download purchased products
- Manage account (email verification, profile)

### 4.3 Admin
- All user capabilities
- Dashboard with revenue/order/user stats
- CRUD products (with image upload, gallery, categories)
- Manage orders (status: pending → processing → completed → cancelled)
- Manage users (role change, delete)
- Manage coupons (percentage/fixed, expiry, max uses, categories)
- Theme customizer (colors, fonts, logo, hero, CSS)
- Discord webhook configuration (user + admin webhooks)

---

## 5. Features

### 5.1 Authentication
- Email/password registration with verification code
- Discord OAuth2 (JWT-signed state, stateless)
- JWT-based sessions (no server-side sessions)
- Protected routes via `auth` middleware

### 5.2 Products
- Name, slug, description, short description
- Price + optional sale price (old price comparison)
- Category (maps, mlo, interior, exterior, build, other)
- Thumbnail + gallery images (Cloudinary)
- Features list + requirements list
- Tags (comma-separated)
- In stock / out of stock toggle
- Featured flag for homepage

### 5.3 Cart & Checkout
- Client-side cart (React Context, localStorage)
- Coupon validation (percentage or fixed discount, min amount, max uses, expiry, category filter)
- Stripe Checkout integration
- Order creation with items snapshot
- Email confirmation on purchase

### 5.4 Orders
- Per-user order history
- Status lifecycle: pending → processing → completed / cancelled
- Auto-polling every 10s for status updates
- Admin bulk order management

### 5.5 Admin Panel
Tabs: Dashboard, Products, Orders, Users, Coupons, Theme, Webhooks

- **Dashboard**: Revenue, order/product/user counts, recent orders list
- **Products**: List with edit/delete, modal form with image upload + gallery + reorder
- **Orders**: List with status dropdown, auto-refresh
- **Users**: List with role change, delete, expandable order history
- **Coupons**: List with edit/delete, modal form (code, type, value, min, max, expiry, categories)
- **Theme**: Full theme customizer (colors, fonts, logo, favicon, hero, bg image, custom CSS)
- **Webhooks**: User/admin Discord webhook URL config + test button

### 5.6 Localization
- Full bilingual support: Arabic (RTL) / English (LTR)
- `LanguageContext` with `t()` function
- ~90 translation sections, ~650 keys per language
- Language toggle persists in `localStorage`
- RTL/LTR direction set on `<html>` element

### 5.7 Theming
- Dark/Light mode toggle (persisted in `localStorage`)
- Material 3 Cyber-Nexus design (glassmorphism, neon glow, dark purple/blue palette)
- Admin-configurable: colors, fonts, logos, background, custom CSS
- Tailwind CSS utility classes + CSS custom properties

### 5.8 Discord Integration
- Discord login (OAuth2)
- User event webhooks: register, login, purchase
- Admin event webhooks: product create/update/delete
- @everyone ping for: new product, deleted product, price/sale changes
- Bilingual Discord embeds (Arabic + English fields)
- Webhook URLs configurable from admin panel

### 5.9 Email
- Verification emails (6-digit code, 15-min expiry)
- Password reset emails
- Order confirmation emails
- SendGrid SMTP integration
- From address configurable via `EMAIL_FROM` env var

---

## 6. Data Models

### User
```
username, email, password (hashed), discordId, discordAvatar,
role (user|admin), isVerified, verificationCode, verificationCodeExpires,
resetPasswordCode, resetPasswordExpires, purchases[], orderCount
```

### Product
```
name, slug, description, shortDescription, price, oldPrice (salePrice),
category, thumbnail, images[], features[], requirements[], tags[],
inStock, featured, createdAt, updatedAt
```

### Order
```
user (ref User), items[{ productId, name, price, quantity, thumbnail }],
totalAmount, totalPrice, status (pending|processing|completed|cancelled),
paymentMethod, coupon (ref Coupon), createdAt
```

### Coupon
```
code, type (percentage|fixed), value, minAmount, maxUses, currentUses,
expiresAt, categories[], active, createdAt
```

### Theme
```
siteName, siteLogo, favicon, bgPrimary, bgSecondary, bgCard, bgCardHover,
bgInput, borderColor, borderHover, textPrimary, textSecondary, textMuted,
accent, accentLight, fontFamily, headingFont, borderRadius,
heroTitle, heroSubtitle, heroBg, bgImage, bgRepeat, bgSize,
customCss, footerText
```

### Setting
```
key, value (mixed — used for webhook URLs, email config, theme)
```

---

## 7. API Endpoints

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Register with email |
| POST | `/login` | — | Login with email/password |
| GET | `/me` | JWT | Get current user |
| GET | `/discord` | — | Discord OAuth redirect |
| GET | `/discord/callback` | — | Discord OAuth callback |
| POST | `/verify` | JWT | Verify email with code |
| POST | `/resend-verification` | JWT | Resend verification code |
| POST | `/forgot-password` | — | Request password reset |
| POST | `/reset-password` | — | Reset password with code |

### Products (`/api/products`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | List products (query: category, featured, limit, search, sort) |
| GET | `/:slug` | — | Get product by slug |

### Orders (`/api/orders`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | JWT | Create order (Stripe checkout) |
| GET | `/` | JWT | Get user's orders |

### Coupons (`/api/coupons`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/validate` | — | Validate coupon code (body: code, totalAmount) |

### Admin (`/api/admin`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/dashboard` | admin | Dashboard stats + recent orders |
| GET | `/products` | admin | List all products |
| POST | `/products` | admin | Create product |
| PUT | `/products/:id` | admin | Update product |
| DELETE | `/products/:id` | admin | Delete product |
| GET | `/orders` | admin | List all orders |
| PUT | `/orders/:id/status` | admin | Update order status |
| GET | `/users` | admin | List all users |
| PUT | `/users/:id/role` | admin | Change user role |
| DELETE | `/users/:id` | admin | Delete user |
| GET | `/coupons` | admin | List all coupons |
| POST | `/coupons` | admin | Create coupon |
| PUT | `/coupons/:id` | admin | Update coupon |
| DELETE | `/coupons/:id` | admin | Delete coupon |
| GET | `/webhooks` | admin | Get webhook URLs |
| PUT | `/webhooks` | admin | Save webhook URLs |
| POST | `/webhooks/test` | admin | Send test webhook |

### Theme (`/api/theme`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | Get current theme |
| PUT | `/` | admin | Save theme |
| POST | `/reset` | admin | Reset theme to defaults |

### Upload (`/api/upload`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | admin | Upload image (returns URL) |

### Debug
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/debug` | — | JWT config info |
| GET | `/api/health` | — | Health check |

---

## 8. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `DISCORD_CLIENT_ID` | Yes | Discord OAuth client ID |
| `DISCORD_CLIENT_SECRET` | Yes | Discord OAuth client secret |
| `DISCORD_CALLBACK_URL` | Yes | Discord OAuth callback URL |
| `FRONTEND_URL` | Yes | Client URL (CORS + redirects) |
| `NODE_ENV` | No | `production` or `development` |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `EMAIL_HOST` | No | SMTP host (SendGrid: smtp.sendgrid.net) |
| `EMAIL_PORT` | No | SMTP port (587) |
| `EMAIL_USER` | No | SMTP username (SendGrid API key) |
| `EMAIL_PASS` | No | SMTP password |
| `EMAIL_FROM` | No | Verified sender email |
| `REACT_APP_API_URL` | No | Client API base URL (defaults to `/api`) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |

---

## 9. Design System

### Material 3 Cyber-Nexus (Tailwind CSS)
- **Primary**: `#c6bfff` (light purple)
- **Accent-Electric**: `#00D1FF` (cyan)
- **Surface**: `#111317` (dark), `#f5f5fa` (light)
- **Glass morphism**: `backdrop-filter: blur(12px)`, semi-transparent backgrounds
- **Neon glow**: `box-shadow` with accent color
- **Typography**: IBM Plex Sans Arabic (body), Space Grotesk (prices/display)
- **Border radius**: `rounded-2xl` (16px) for cards, `rounded-3xl` for modals
- **Dark mode**: Tailwind `dark` class on `<html>`, CSS custom properties for colors

---

## 10. Known Issues / Blockers

1. **Discord OAuth 401 on Render**: `GET /api/auth/me` returns 401 after Discord callback. JWT token generated by server but rejected by auth middleware. Likely `JWT_SECRET` mismatch or deployment cache issue.
2. **Email spam**: Emails sent via SendGrid from non-verified domain go to spam. Requires SPF/DKIM/DMARC DNS records for the sender domain.
3. **MongoDB startup timeout**: Server must listen immediately to avoid Render 502. Fixed by starting `app.listen()` before `mongoose.connect()`.
4. **Cloudinary not configured**: File uploads fall through without Cloudinary env vars.

---

## 11. Localization Coverage

| Section | Status |
|---------|--------|
| Navbar | ✅ Full |
| Home (hero, features, featured, categories, CTA, testimonials, stats) | ✅ Full |
| Shop (title, search, sort, empty) | ✅ Full |
| ProductCard | ✅ Full |
| ProductDetail | ✅ Full |
| Cart | ✅ Full |
| Checkout | ✅ Full |
| Login | ✅ Full |
| Register | ✅ Full |
| Dashboard | ✅ Full |
| Orders | ✅ Full |
| Admin (all 7 tabs) | ✅ Full |
| Footer | ✅ Full |
| NotFound | ✅ Full |
| DiscordSuccess | ✅ Full |
| SimplePages (contact, faq, terms, refund) | ✅ Full |
| Common (loading, error, save, cancel, etc.) | ✅ Full |

---

## 12. Build & Deploy

- **Client**: `cd client && npm run build` → outputs to `client/build/`
- **Server**: `cd server && npm start` → Express serves static `build/` + API
- **Render**: Auto-deploys from GitHub `main` branch. "Clear build cache & deploy" for fresh builds.
- **Health check**: `GET /api/health` returns `{ status: 'ok' }`

---

## 13. Future Enhancements

- Product file downloads (digital delivery)
- Reviews/ratings system
- Wishlist
- Multiple payment gateways (PayPal)
- Order notifications via email/Discord on status change
- User profile editing (avatar, password change)
- Product variants (tiers, options)
- Analytics dashboard (sales charts, top products)
- Bulk coupon import/export
- SEO optimization (meta tags, sitemap)
- PWA support (service worker, offline page)
- Rate limiting per-user (not just global)

---

*Document version: 1.0 • Last updated: June 2026*
