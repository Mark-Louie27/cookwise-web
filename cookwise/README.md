# 🍳 CookWise — AI-Powered Recipe & Cooking Tutorial App

A full-stack Next.js web app with offline support, Edamam recipe search, and an AI cooking assistant powered by Groq.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔍 Recipe Search | Powered by Edamam (2.3M+ recipes), filterable by meal type & diet |
| 🤖 AI Chef Assistant | Groq + Llama 3.3 70B — instant cooking help, tips, substitutions |
| 📱 PWA / Offline | Installable on mobile, saved recipes work offline via IndexedDB |
| 🔖 Save Recipes | Bookmark recipes locally, no account needed |
| 🧑‍🍳 Interactive Ingredients | Check off ingredients while cooking |
| 🎨 Beautiful UI | Custom design system with Tailwind CSS |

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```

Fill in your API keys in `.env.local`:

```env
EDAMAM_APP_ID=your_app_id
EDAMAM_APP_KEY=your_app_key
GROQ_API_KEY=your_groq_key
```

### 3. Get API Keys

**Edamam** (Recipe Search):
1. Go to https://developer.edamam.com/edamam-recipe-api
2. Sign up for a free account
3. Create an app → get your App ID and App Key
4. Use the **Recipe Search API v2** plan

**Groq** (AI Chat):
1. Go to https://console.groq.com
2. Sign up (free, very fast inference)
3. Create an API Key

### 4. Run locally
```bash
npm run dev
```

Open http://localhost:3000

---

## 📁 Project Structure

```
cookwise/
├── app/
│   ├── api/
│   │   ├── recipes/route.ts    # Edamam proxy
│   │   └── chat/route.ts       # Groq AI chat
│   ├── chat/page.tsx           # Full-screen AI chat
│   ├── recipe/[id]/page.tsx    # Recipe detail page
│   ├── saved/page.tsx          # Offline saved recipes
│   ├── page.tsx                # Home / search
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── RecipeCard.tsx
│   ├── SearchBar.tsx
│   └── ChatWidget.tsx          # Floating chat bubble
├── lib/
│   └── db.ts                   # IndexedDB helpers
├── types/
│   └── index.ts
└── public/
    └── manifest.json           # PWA manifest
```

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + custom CSS variables
- **Recipe Data**: Edamam Recipe Search API v2
- **AI**: Groq API (Llama 3.3 70B Versatile)
- **Offline Storage**: IndexedDB (via custom lib/db.ts)
- **PWA**: Web App Manifest + installable on mobile

---

## 🌐 Deploying to Vercel

```bash
npm i -g vercel
vercel
```

Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## 📝 Notes

- Recipe detail pages use `sessionStorage` to pass data between list → detail. For fully standalone deep links, store recipe data in IndexedDB on card click.
- The Edamam free tier allows ~10,000 calls/month.
- Groq free tier provides very generous limits for Llama 3.3.
