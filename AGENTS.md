# 𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤 — FiveM MLO Store

## Project Overview
Full-stack FiveM MLO store built with MERN stack (MongoDB, Express, React, Node.js).
Deployed on Render, source on GitHub.

## Tech Stack
- **Frontend**: React (Create React App), Tailwind CSS, Axios
- **Backend**: Express.js, Mongoose, Passport.js, JWT
- **Key Packages**: jsonwebtoken, bcryptjs, stripe, passport-discord, multer (cloudinary)

## Environment Variables (Server)
```
MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET,
DISCORD_CALLBACK_URL, FRONTEND_URL, NODE_ENV, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
CLOUDINARY_API_SECRET
```

## Environment Variables (Client)
```
REACT_APP_API_URL (defaults to '/api')
```

## Key Architecture Decisions
- **Webhook URLs** stored in DB (Setting model), cached in memory via `loadWebhooks()` on startup
- **Discord OAuth state** uses JWT-signed tokens (stateless, no session dependency) — works across multiple Render instances
- **Session** only used for state check (which now uses JWT), `sameSite: 'lax'`, credentials: true
- **Bilingual** (Arabic + English) for all Discord embeds and email templates

## Discord Webhook Behavior
- **User webhook**: register, login, purchase events
- **Admin webhook**: product create/delete (with @everyone), product update with change detection (price/sale changes get @everyone)
- **Test webhook**: POST /api/admin/webhooks/test sends a test embed
- **Admin API**: GET/PUT /api/admin/webhooks to manage URLs from admin panel

## Completed Work
- Discord webhook utility with bilingual fields
- User event logging (register, login, purchase)
- Admin event logging (product CRUD with change detection, @everyone for important changes)
- Admin webhook settings UI in Admin.js
- Session sameSite: strict → lax (for cross-site redirect OAuth flow)
- **JWT-based Discord OAuth state** (eliminates session dependency entirely — fixes cross-instance state mismatch on Render)
- Rebranded all references to 𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤
- Bilingual email templates, copyright 2026

## Current Issues
- **401 on `/api/auth/me` after Discord callback**: User reports 401 after Discord OAuth login on Render. JWT token is saved to localStorage but rejected by server. Possible causes:
  - `JWT_SECRET` env variable missing or different on Render
  - Need "Clear build cache & deploy" on Render dashboard
  - Session state mismatch across Render instances (FIXED with JWT-based state)
- User needs to manually redeploy on Render

## Key Files
- `server/src/utils/discord.js` — webhook embeds, bilingual, @everyone, test
- `server/src/controllers/authController.js` — Discord OAuth with JWT-signed state
- `server/src/controllers/adminController.js` — product CRUD + webhook settings
- `server/src/controllers/orderController.js` — purchase → Discord notification
- `server/src/middleware/auth.js` — JWT verification
- `server/src/config/index.js` — env config
- `server/src/config/passport.js` — Passport Discord strategy
- `server/src/routes/admin.js` — admin routes
- `server/src/index.js` — Express setup, session, webhook loader
- `client/src/pages/DiscordSuccess.js` — handles token from Discord callback
- `client/src/context/AuthContext.js` — axios, token, fetchUser
- `client/src/pages/Admin.js` — admin panel with webhooks tab

## Build & Deploy
- **Server**: `cd server && npm install && npm start`
- **Client**: `cd client && npm install && npm run build`
- **Render**: Auto-deploys from GitHub main branch. "Clear build cache & deploy" for fresh build.
