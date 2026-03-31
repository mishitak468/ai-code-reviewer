# AI Code Reviewer

> An AI-powered code analysis platform that gives you real-time, structured feedback on your code — like having a senior engineer on call, 24/7.

🔗 **Live Demo:** [ai-code-reviewer-rust.vercel.app](https://ai-code-reviewer-rust.vercel.app)

---

## What It Does

Paste a snippet of JavaScript, TypeScript, Python, or C++ into the editor, hit analyze, and within seconds you get a scored review broken down into readability, performance, and correctness — complete with a rewritten version of your code. Every review is saved to your personal history so you can track how your code quality improves over time.

This isn't a chatbot wrapper. It's a full-stack SaaS tool with persistent storage, private user accounts, and a production CI/CD pipeline.

---

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) + Tailwind CSS | Single-page dashboard and history archive |
| **AI Engine** | Groq API — Llama 3.3 70B | Sub-second code analysis via LPU inference |
| **Database** | PostgreSQL (Supabase) + Prisma ORM | Persistent, relational storage for all reviews |
| **Auth** | Clerk | Multi-tenant authentication with Edge Middleware |
| **Deployment** | Vercel + GitHub Actions | Automated CI/CD — every push ships to production |

---

## Architecture Overview

```
User Request
     │
     ▼
┌─────────────────────┐
│  Clerk Middleware   │  ← Blocks unauthenticated requests at the edge
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   Next.js Frontend  │  ← Code editor UI, state management (React Hooks)
│   page.tsx          │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  /api/review        │  ← Server-side route; sends code to Groq
│  route.ts           │    Returns structured JSON (score + fixed code)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐     ┌──────────────────────┐
│  Groq (Llama 3.3)  │     │  Supabase PostgreSQL  │
│  LPU Inference     │     │  via Prisma ORM       │
└─────────────────────┘     └──────────────────────┘
```

---

## Key Features

- **Instant AI Feedback** — Groq's LPU architecture delivers analysis in under a second, far faster than traditional GPU-based inference.
- **Structured JSON Output** — The AI is prompted to return a consistent schema (score, issues, fixed code) so the frontend can parse and display it reliably — not just dump raw text.
- **Private Review History** — Every analysis is stored in PostgreSQL and scoped to the authenticated user. User A cannot access User B's reviews.
- **Edge Authentication** — Clerk middleware runs at the CDN edge before any page loads, making auth both secure and performant.
- **Automated Deployments** — Pushing to `main` triggers a TypeScript check, build, and global deploy on Vercel automatically.

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main dashboard — editor UI and AI trigger
│   │   └── history/
│   │       └── page.tsx          # User's personal review archive
│   ├── api/
│   │   ├── review/
│   │   │   └── route.ts          # AI engine — integrates with Groq/Llama 3.3
│   │   └── history/
│   │       └── route.ts          # Database controller — queries via Prisma + Clerk auth
│   └── middleware.ts             # Edge security — intercepts and validates every request
├── prisma/
│   └── schema.prisma             # Data schema — defines Review model and relationships
├── .env.local                    # Local secrets (never committed)
└── .gitignore                    # Keeps API keys off GitHub
```

---

## Environment Variables

This project requires the following secrets, managed through Vercel's environment dashboard and a local `.env.local` file.

```env
# Groq — LPU inference for Llama 3.3
GROQ_API_KEY=

# Supabase — PostgreSQL connection string
DATABASE_URL=

# Clerk — server-side identity verification
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

> **Never commit `.env.local` to version control.** It's in `.gitignore` by default.

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/mishitak468/ai-code-reviewer.git
cd ai-code-reviewer

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your keys (Groq, Supabase, Clerk)

# 4. Push the Prisma schema to your database
npx prisma db push

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Schema

```prisma
model Review {
  id        String   @id @default(cuid())
  userId    String
  language  String
  code      String
  feedback  Json
  createdAt DateTime @default(now())
}
```

The `userId` field maps directly to Clerk's authenticated user ID, making it straightforward to scope every database query to the logged-in user without any additional join logic.

---

## What I Learned Building This

This project forced me to think beyond individual technologies and reason about how systems connect. A few things that stood out:

- **Prompt engineering matters more than you'd think.** Getting Llama 3.3 to consistently return valid, parseable JSON — not markdown, not prose, not partial objects — required careful iteration on the system prompt. Small wording changes had a big impact on reliability.
- **Edge middleware is underused.** Running Clerk auth at the edge instead of inside each route handler is a meaningful performance win. It blocks unauthenticated requests before they ever reach your server logic.
- **Prisma makes schema changes safe.** Being able to modify `schema.prisma` and push changes without writing raw migration SQL kept the database in sync with the application without guesswork.

---

## Skills Demonstrated

- **Full-Stack Development** — Next.js App Router, React Hooks, server and client components
- **AI Integration** — LLM inference orchestration, structured output, prompt engineering
- **Database Engineering** — Relational schema design, Prisma ORM, PostgreSQL
- **Authentication** — Clerk multi-tenant auth, Edge Middleware, secure session handling
- **DevOps** — CI/CD with GitHub + Vercel, environment variable management, TypeScript strict mode
- **Security** — Secret management, route protection, user data isolation

---

## Deployment

This project is deployed on **Vercel** with automatic deployments triggered on every push to `main`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
