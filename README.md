# Rapid AI — Sales Lead Automation Frontend

A modern B2B SaaS frontend for **Rapid AI**: manage leads, run AI-assisted outbound campaigns, automate follow-ups, schedule meetings, and track pipeline analytics. Built with Vite, React 18, TypeScript, Tailwind CSS, and shadcn/ui.

![License](https://img.shields.io/badge/license-Private-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)

## Features

- **Authentication** — Email/password signup with OTP verification, forgot/reset password, Google OAuth, and automatic access-token refresh.
- **Dashboard** — KPIs, performance charts, active campaigns, and recent activity.
- **Leads** — List, filter, enrich, and inspect lead details; bulk assign to campaigns.
- **Campaigns** — Create/edit campaigns (wizard + detail), follow-up sequences, campaign leads, duplicate campaigns, auto/manual run modes.
- **Meetings** — List and calendar views, create/edit/cancel meetings, Google sync options, past-date validation.
- **Analytics** — Sent vs. replies, reply breakdown, campaign comparison, and chart tooling.
- **Notifications** — In-app notifications and Firebase Cloud Messaging (FCM) push registration.
- **Billing** — Stripe-backed plans, subscription management, checkout/upgrade/downgrade, payment methods, and billing portal (Settings).
- **Marketing home** — Public landing page at `/` for unauthenticated visitors.
- **Design system** — Teal-forward Rapid AI theme (light/dark), Sora + DM Sans typography, responsive app shell with sidebar.

## Tech stack

| Layer | Libraries |
| :--- | :--- |
| **Build** | [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **UI** | [React 18](https://react.dev/), [React Router 6](https://reactrouter.com/), [Tailwind CSS 3](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (Radix primitives) |
| **State** | [Zustand](https://zustand.docs.pmnd.rs/) |
| **Forms / validation** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **HTTP** | [Axios](https://axios-http.com/) (interceptors, token refresh) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Push** | [Firebase](https://firebase.google.com/) (FCM web) |
| **Testing** | [Vitest](https://vitest.dev/), Testing Library, [Playwright](https://playwright.dev/) |
| **Utilities** | [date-fns](https://date-fns.org/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) |

## Getting started

### Prerequisites

- **Node.js** v20 or higher recommended
- **npm** v10 or higher
- A running **Rapid AI backend API** (see `VITE_API_BASE_URL`)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd sales-lead-automation-frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment:**

   Copy `.env.example` to `.env.local` (or `.env`) and set values for your environment:

   ```bash
   cp .env.example .env.local
   ```

   Minimum for local development:

   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

   For push notifications, also configure the `VITE_FIREBASE_*` and `VITE_FIREBASE_VAPID_KEY` variables from Firebase Console.

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:8080](http://localhost:8080) in your browser.

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Vite dev server (default port **8080**) |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Development-mode build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests once |
| `npm run test:watch` | Run Vitest in watch mode |

## Project structure

```
sales-lead-automation-frontend/
├── public/                          # Static assets (logo, favicon, etc.)
├── src/
│   ├── components/
│   │   ├── analytics/               # Chart tooltips and analytics UI
│   │   ├── auth/                    # Auth layout, Google sign-in/link
│   │   ├── campaigns/               # Wizard, detail, leads, follow-ups
│   │   ├── dashboard/               # Dashboard-specific controls
│   │   ├── layout/                  # App shell, sidebar, topbar, pagination
│   │   ├── leads/                   # Lead table, filters, detail sheet
│   │   ├── marketing/               # Public site layout
│   │   ├── meetings/                # Calendar, list, create/cancel dialogs
│   │   ├── settings/                # Settings form helpers
│   │   ├── skeletons/               # Loading skeletons per feature
│   │   └── ui/                      # shadcn/ui primitives
│   ├── core/types/                  # Shared domain types (e.g. AuthUser)
│   ├── hooks/                       # useCampaignDetailForm, useFcmPush, etc.
│   ├── lib/                         # API client, auth refresh, formatters, mappers
│   │   ├── analytics/
│   │   ├── billing.ts
│   │   ├── meetings/
│   │   ├── axiosInstance.ts         # Axios + TOKEN_EXPIRED refresh flow
│   │   └── apiURL.ts                # Centralized API paths
│   ├── pages/
│   │   ├── auth/                    # Login, signup, OTP, password reset
│   │   ├── billing/                 # Stripe return pages (success/cancel)
│   │   ├── Home.tsx                 # Marketing landing page
│   │   ├── Dashboard.tsx
│   │   ├── Leads.tsx
│   │   ├── Campaigns.tsx
│   │   ├── Meetings.tsx
│   │   ├── Analytics.tsx
│   │   ├── Notifications.tsx
│   │   └── Settings.tsx             # Profile, billing, notifications
│   ├── services/                    # API service modules per domain
│   ├── store/                       # Zustand stores (auth, campaigns, billing, …)
│   ├── types/                       # API request/response TypeScript types
│   ├── validators/                  # Zod schemas (auth, campaigns, meetings)
│   ├── test/                        # Vitest unit tests
│   ├── App.tsx                      # Routes and auth gate
│   ├── main.tsx
│   └── index.css                    # Rapid AI design tokens (HSL theme)
├── .env.example
├── components.json                  # shadcn/ui config
├── eslint.config.js
├── tailwind.config.ts
├── vite.config.ts
├── vitest.config.ts
└── render.yaml                      # Render static site + SPA rewrite routes
```

## Environment variables

All client-side variables must use the `VITE_` prefix (exposed to the browser).

| Variable | Description | Required |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend REST API base URL (e.g. `https://api.example.com/api`) | Yes |
| `VITE_FIREBASE_API_KEY` | Firebase web app API key | For push |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | For push |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | For push |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | For push |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID | For push |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | For push |
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics measurement ID | Optional |
| `VITE_FIREBASE_VAPID_KEY` | Web push VAPID key (FCM) | For push |

Server-only keys in `.env.example` (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) belong on the **API server**, not this frontend.

## Routing overview

| Path | Access | Description |
| :--- | :--- | :--- |
| `/` | Public | Marketing home (guests); redirects to dashboard when signed in |
| `/login`, `/signup` | Public | Authentication |
| `/verify-otp`, `/forgot-password`, `/reset-password` | Public | Account verification and password flows |
| `/auth/google/callback` | Public | Google OAuth callback |
| `/dashboard`, `/leads`, `/campaigns`, … | Protected | App shell (requires auth) |
| `/billing/success`, `/billing/cancel` | Protected | Stripe checkout return handlers |

## Auth and session notes

- **Access token** is stored in `localStorage`; **refresh token** in `sessionStorage` (cleared when the browser tab/session ends).
- On app load, `initializeAuth()` proactively calls `/auth/refresh` when both tokens exist.
- Axios interceptors refresh on `TOKEN_EXPIRED` (HTTP 401 or 200 error body) and retry failed requests.

## Deployment (Render)

The app is a static SPA deployed to [Render](https://render.com) as a **Static Site**.

| Setting | Value |
| :--- | :--- |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

**SPA routing (required):** Direct URLs like `/login` and `/auth/google/callback` must serve the app shell (`index.html`) so React Router can handle the path. This repo uses two layers:

1. **Build output (`scripts/spa-fallback.mjs`)** — copies `dist/index.html` to `dist/404.html` after every build. Render serves `404.html` for missing paths, which loads the SPA even when no rewrite rule is configured.
2. **Render rewrite rule (recommended)** — configure one of:
   - **`render.yaml`** in the repo (included) — rewrite `/*` → `/index.html` (applied when the service is managed by a Render Blueprint)
   - **Render Dashboard** → your static site → **Redirects/Rewrites** → Add rule:
     - Source: `/*`
     - Destination: `/index.html`
     - Action: **Rewrite** (not Redirect)

Set `VITE_API_BASE_URL` (and Firebase vars if using push) in Render **Environment** for the static site. Ensure the backend sets Stripe `success_url` / `cancel_url` / portal `return_url` to your production frontend origin—not `localhost`.

## Contributing

1. Create a feature branch from the latest `main`.
2. Run `npm run lint` and `npm run test` before opening a PR.
3. Use clear commit messages (e.g. `feat: add meeting date validation`, `fix: refresh token on TOKEN_EXPIRED`).

## License

Private property of RapidShips LLC.
