# 🚀 Next.js 16.2 Boilerplate

A production-grade [Next.js 16.2](https://nextjs.org) App Router starter for SaaS — session auth, typed API envelope, Drizzle ORM scaffold, billing hooks, and a **full design system** powered by [`@uipkge-react`](https://uipkge.dev/react/setup). **Every external integration is gated on env** so cloning gives you a working app *today*; configuring services flips them on. No accounts required to start.

![Dashboard preview](./.github/assets/dashboard.png)

<details>
<summary><b>📸 More screenshots — 6 pages</b></summary>

### Kanban board (`/dashboard/kanban`)

![Kanban board](./.github/assets/kanban.png)

### Data table (`/dashboard/data-table`)

![Data table](./.github/assets/data-table.png)

### Calendar (`/dashboard/calendar`)

![Calendar](./.github/assets/calendar.png)

### Public landing (`/`)

![Landing page](./.github/assets/landing.png)

### Sign-in (`/login` — demo mode active)

![Login page](./.github/assets/login.png)

</details>

> ### 🎨 Powered by [UIPKGE](https://uipkge.dev) — the design system that makes this boilerplate *look* like a product, not a starter
>
> Every UI element, block, and chart in this repo comes from the **`@uipkge-react`** registry — a curated shadcn-compatible React distribution that ships **the entire shape of a SaaS app**:
>
> - 🔐 **Full auth UI** — sign-in, sign-up, magic-link, forgot-password, MFA, invite-by-token, onboarding stepper
> - 🌐 **Full public / marketing UI** — hero sections, feature grids, CTA bands, pricing tables, FAQ accordions, testimonials, footer + header navs, terms / privacy shells
> - 🔒 **Full private / dashboard UI** (protected routes) — collapsible sidebar, breadcrumbs, command palette, team switcher, profile menu, settings shell, kanban board, calendar, data table, messages
> - 📈 **Charts** — area, bar, line, pie, radar, sparkline (themed light + dark via `echarts-for-react`)
> - 📋 **Forms + tables** — React Hook Form fields + TanStack Table data grids (sortable, filterable, paginated)
> - ✏️ **Rich editor** — Tiptap with links, placeholders, task lists, text-align
> - 🧱 **Elements** — button, dialog, command, combobox, date-picker, drawer, sheet, tooltip, context-menu, ... (the full shadcn/ui surface)
>
> All using the same design tokens, same theming, same Tailwind v4 setup. One CLI command:
>
> ```bash
> npx shadcn@latest add @uipkge-react/<name> -y
> ```
>
> The component source is copied into your project — **fully owned, fully editable, no runtime dependency, no lock-in.** [Browse the React catalog →](https://uipkge.dev/react/components) · [Jump to the full UIPKGE section ↓](#-uipkge--ready-to-use-elements-blocks--charts)

🌟 **Try it locally** — clone, run `npm run dev`, open **[`/login`](http://localhost:3000/login)**, and click **Continue as demo user** to explore the protected dashboard without OAuth or a database.

Vue/Nuxt twin with the same registry surface: **[nuxt-boilerplate.uipkge.dev](https://nuxt-boilerplate.uipkge.dev/login)** (also uses demo sign-in on `/login`).

```bash
git clone https://github.com/uday-a/next-boilerplate my-app
cd my-app
npm install
echo "AUTH_SECRET=$(openssl rand -base64 32)" > .env
echo "DEMO_MODE=true" >> .env
echo "NEXT_PUBLIC_DEMO_MODE=true" >> .env
npm run dev
# → http://localhost:3000
# → http://localhost:3000/login  (demo sign-in)
```

That's it. The boilerplate runs in **demo mode** with no DB, no OAuth app, no API keys. Swap env vars when you're ready to enable real services.

### Key routes (after `npm run dev`)

| Page | Path | Notes |
|------|------|-------|
| Landing | [`/`](http://localhost:3000/) | Marketing blocks — header links to **Sign in** / **Start free trial** |
| **Sign in** | [`/login`](http://localhost:3000/login) | GitHub OAuth + magic-link form; **Continue as demo user** when demo mode is on |
| Sign up | [`/sign-up`](http://localhost:3000/sign-up) | Links back to `/login` |
| Dashboard | [`/dashboard`](http://localhost:3000/dashboard) | Protected — proxy redirects to `/login?next=…` until signed in |
| Kanban | `/dashboard/kanban` | Full registry kanban block |
| Customers table | `/dashboard/data-table` | TanStack Table demo |
| Calendar | `/dashboard/calendar` | Month grid, context menus, event detail dialog |
| Settings | `/settings` | Account, billing, team, … |

---

## 🚀 Features

### Developer experience

- ✅ **Next.js 16.2** App Router + **React 19** + TypeScript
- ✅ **Turbopack** dev server (`next dev --turbopack`)
- ✅ **`zod`-validated env** at boot — partial configs fail loud with friendly errors
- ✅ **`components.json`** pre-wired for `@uipkge-react` registry URLs
- ✅ **`npm run bootstrap:registry`** — refresh installed registry items from the sibling `uipkge-ui` monorepo

### Frontend

- ✅ **Tailwind CSS v4** with UIPKGE OKLCH tokens (`app/globals.css`)
- ✅ **[`@uipkge-react`](https://uipkge.dev/react/components)** registry — marketing blocks, auth cards, dashboard shell, kanban, data table, calendar
- ✅ **Radix UI** — the headless layer shadcn/ui is built on
- ✅ **Three-state theme** (`light` / `dark` / `system`) via `next-themes`
- ✅ **TanStack Table** + **React Hook Form** + **echarts-for-react** + **Tiptap** + **lucide-react**
- ✅ Pre-built pages: landing, login/sign-up, dashboard KPIs, kanban, customers table, calendar (context menus), activity heatmap, messages, UI kit, settings, projects

### Backend (Route Handlers)

- ✅ **Typed API envelope** — every `app/api/**` route returns `{ ok: true, data }` or `{ ok: false, error: { code, message, details? } }`
- ✅ **Structured error codes** — `UNAUTHORIZED` / `FORBIDDEN` / `NOT_FOUND` / `VALIDATION_FAILED` / `RATE_LIMITED` / `INTERNAL`
- ✅ **`requireAuth()` / `requireRole()`** guards on protected routes
- ✅ **iron-session** encrypted cookie sessions (like `nuxt-auth-utils`)
- ✅ **Structured logger** — dot-namespaced events, optional Axiom shipping
- ✅ **Webhook raw-body handling** — Polar signature verification

### 🔐 Auth

- ✅ **GitHub OAuth** — `GET /api/auth/github` + callback handler
- ✅ **Magic-link** sign-in — `POST /api/auth/magic-link` (needs `DATABASE_URL` + Resend)
- ✅ **Demo mode** — `POST /api/auth/demo` mints a fake-user session; UI at `/login` shows **Continue as demo user**
- ✅ **Middleware** — protects `/dashboard`, `/settings`, `/projects`, `/feedback`, … redirects to `/login?next=…`
- ✅ **Admin bootstrap** — `INITIAL_ADMIN_LOGINS` env lists GitHub usernames that land as `role='admin'` on first sign-in

### 💾 Database

- ✅ **Drizzle ORM** + **`postgres`** driver with lazy singleton
- ✅ Works against **Neon**, **Supabase pooler**, **Railway**, **RDS**, or local Postgres
- ✅ Schema in `server/db/schema.ts` — `users`, `projects`, `subscriptions`, `magic_link_tokens`
- ✅ `npm run db:generate` / `npm run db:migrate` via drizzle-kit

### 💰 Billing — Polar.sh

- ✅ **Checkout** — `POST /api/billing/checkout`
- ✅ **Customer portal** — `POST /api/billing/portal`
- ✅ **Signature-verified webhook** — `POST /api/webhooks/polar`

### 📧 Email — Resend

- ✅ **Dev fallback** — without `RESEND_API_KEY`, mailer logs to stdout

### 📊 Observability (optional)

- ✅ **Sentry** — `NEXT_PUBLIC_SENTRY_DSN`
- ✅ **PostHog** — client plugin no-ops without key
- ✅ **Axiom** — structured log shipping

---

## 🎨 UIPKGE — ready-to-use elements, blocks & charts

This boilerplate is wired to the [**`@uipkge-react`**](https://uipkge.dev/react/setup) registry. Everything installs with the standard shadcn CLI and lands under `components/` — fully owned, fully editable.

```bash
npx shadcn@latest add @uipkge-react/button -y
npx shadcn@latest add @uipkge-react/kanban-board -y
```

### Registry config

Already wired in [`components.json`](./components.json):

```json
{
  "registries": {
    "@uipkge-react": "https://uipkge.dev/r/react/{name}.json"
  }
}
```

> 🔗 Browse the full catalog at **[uipkge.dev/react/components](https://uipkge.dev/react/components)** · Vue twin uses **`@uipkge`** at [uipkge.dev/vue/components](https://uipkge.dev/vue/components)

---

## 🛠 Built with

| Layer | Library |
|---|---|
| Framework | [Next.js 16.2](https://nextjs.org) (React 19, App Router, TypeScript) |
| Auth | [iron-session](https://github.com/vvo/iron-session) + GitHub OAuth |
| ORM / DB | [Drizzle ORM](https://orm.drizzle.team) + [postgres](https://github.com/porsager/postgres) |
| Styling | [Tailwind v4](https://tailwindcss.com) |
| Primitives | [shadcn/ui](https://ui.shadcn.com) (`@uipkge-react` registry) on [Radix UI](https://www.radix-ui.com) |
| Tables | [TanStack Table](https://tanstack.com/table) |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Editor | [Tiptap](https://tiptap.dev) |
| Charts | [echarts-for-react](https://github.com/hustcc/echarts-for-react) |
| Icons | [lucide-react](https://lucide.dev) |
| Billing | [Polar.sh](https://polar.sh) |
| Email | [Resend](https://resend.com) |

---

## 📋 Requirements

- **Node 22+** (see `engines` in `package.json`)
- **npm** (lockfile is `package-lock.json`)
- *Optional:* a Postgres URL — required only when you want persistence or magic-link auth

---

## 🚀 Getting started

### 1. Clone + install

```bash
git clone https://github.com/uday-a/next-boilerplate my-app
cd my-app
npm install
```

### 2. Environment

```bash
cp .env.example .env
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env
echo "DEMO_MODE=true" >> .env
echo "NEXT_PUBLIC_DEMO_MODE=true" >> .env
```

Only `AUTH_SECRET` is *required* (32+ chars). `DEMO_MODE` + `NEXT_PUBLIC_DEMO_MODE` enable the **Continue as demo user** bar on [`/login`](http://localhost:3000/login).

### 3. Database (optional)

```bash
# Set DATABASE_URL in .env first, then:
npm run db:migrate
```

Without `DATABASE_URL`, demo auth and GitHub OAuth sessions still work — DB upserts silently no-op.

### 4. Run

```bash
npm run dev        # http://localhost:3000
npm test           # targeted logic tests
npm run build      # production build
npm run start      # serve production build
```

Open **[http://localhost:3000/login](http://localhost:3000/login)** → **Continue as demo user** → explore `/dashboard`, `/dashboard/kanban`, `/dashboard/calendar`, `/settings`, …

---

## 📁 Project structure

```
.
├── app/
│   ├── (marketing)/          # landing, /login, /sign-up, pricing, …
│   ├── (dashboard)/          # sidebar shell + protected pages
│   └── api/                  # Route Handlers (auth, me, billing, webhooks, …)
├── components/
│   ├── blocks/               # @uipkge-react blocks (Header01, kanban-board, …)
│   └── ui/                   # shadcn primitives
├── lib/                      # env, api/response, auth/session, demo-mode, utils
├── server/db/                # Drizzle schema + migrations
├── proxy.ts                  # auth gate → /login?next=…
├── components.json           # shadcn CLI + @uipkge-react registry
└── .env.example
```

---

## 🎚 Graceful degradation matrix

| Env var(s) | Unset behavior | Set behavior |
|---|---|---|
| `AUTH_SECRET` | **Build fails** — required (32+ chars) | Sessions encrypted |
| `GITHUB_CLIENT_ID` + `SECRET` | OAuth button hidden / errors gracefully | GitHub sign-in at `/login` |
| `DEMO_MODE` / `NEXT_PUBLIC_DEMO_MODE` | Auto-on in dev, off in prod | `true` forces demo bar on `/login` |
| `DATABASE_URL` | OAuth/demo skip DB upsert | Drizzle queries run |
| `RESEND_API_KEY` + `EMAIL_FROM` | Magic-link logs to stdout | Real email delivery |
| `POLAR_ACCESS_TOKEN` + `POLAR_WEBHOOK_SECRET` | Billing routes return instructive error | Checkout + portal + webhooks |
| `NEXT_PUBLIC_SITE_URL` | Defaults `http://localhost:3000` | OAuth redirects + canonical URLs |

---

## ⚡ API conventions

```ts
// app/api/projects/route.ts
export async function GET(request: Request) {
  const user = await requireAuth(request)
  const data = await listProjects(user.id)
  return ok(data)
}
```

Response envelope:

```ts
// success
{ ok: true, data: T }
// failure
{ ok: false, error: { code, message, details? } }
```

---

## 🚀 Deployment (Vercel)

**One-click deploy** — generate a session secret, then click:

```bash
openssl rand -base64 32
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/uday-a/next-boilerplate&env=AUTH_SECRET,DEMO_MODE,NEXT_PUBLIC_DEMO_MODE&envDescription=AUTH_SECRET%3A%20openssl%20rand%20-base64%2032.%20Set%20DEMO_MODE%20and%20NEXT_PUBLIC_DEMO_MODE%20to%20true%20for%20public%20previews.&project-name=next-boilerplate&repository-name=next-boilerplate)

| Variable | Required for preview | Value |
|----------|---------------------|-------|
| `AUTH_SECRET` | **Yes** | output of `openssl rand -base64 32` |
| `DEMO_MODE` | **Yes** (public demo) | `true` |
| `NEXT_PUBLIC_DEMO_MODE` | **Yes** (shows demo bar) | `true` |
| `NEXT_PUBLIC_SITE_URL` | After first deploy | `https://your-app.vercel.app` |

After deploy, open **`https://<your-app>.vercel.app/login`** and click **Continue as demo user**. Set both demo flags to `false` when you wire real GitHub OAuth.

### Production checklist

- [ ] Generate a *fresh* `AUTH_SECRET` (never reuse dev).
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your real domain.
- [ ] Set `DEMO_MODE=false` and `NEXT_PUBLIC_DEMO_MODE=false` to harden the demo route.
- [ ] Register OAuth callback: `https://<host>/api/auth/github/callback`.
- [ ] Register Polar webhook: `https://<host>/api/webhooks/polar`.
- [ ] Run `npm run db:migrate` against production `DATABASE_URL`.

---

## ↔ Parity with [nuxt-boilerplate](https://github.com/uday-a/nuxt-boilerplate)

This is the **React/Next.js twin** of the Nuxt 4 SaaS starter. Same registry-driven UI (`@uipkge-react` vs `@uipkge`), same demo-mode ergonomics on **`/login`**, same envelope-shaped APIs, same dashboard routes.

| | Nuxt | Next.js (this repo) |
|---|---|---|
| Live demo | [nuxt-boilerplate.uipkge.dev/login](https://nuxt-boilerplate.uipkge.dev/login) | Deploy to Vercel → `/login` |
| Registry CLI | `npx shadcn-vue add @uipkge/<name>` | `npx shadcn@latest add @uipkge-react/<name>` |
| Session | `nuxt-auth-utils` | `iron-session` |
| Demo sign-in | `POST /auth/demo` | `POST /api/auth/demo` |

---

## 📝 Contributing

PRs welcome. For non-trivial changes, open an issue first.

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

---

## 💖 Acknowledgments

- [Next.js](https://nextjs.org) team
- [shadcn/ui](https://ui.shadcn.com) + [`@uipkge`](https://uipkge.dev) for the component system
- [nuxt-boilerplate](https://github.com/uday-a/nuxt-boilerplate) — the Vue twin this repo mirrors
- [Drizzle](https://orm.drizzle.team) for the ORM
