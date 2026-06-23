# ShopMERN — MERN E-Commerce (TypeScript) Learning Project

A full-stack e-commerce app built to learn market-standard MERN practices and prepare for interviews.

**Monorepo (npm workspaces):**

| Workspace | Purpose |
| --- | --- |
| `client/` | React 19 + Vite + TypeScript + Tailwind CSS frontend |
| `server/` | Node + Express + TypeScript API |
| `packages/types/` | Shared TypeScript types used by both ends |

## Prerequisites

- Node.js >= 20
- A MongoDB connection string (added in Milestone 1)

## Install

```bash
npm install
```

## Develop (runs API + client together)

```bash
npm run dev
```

- API health check: http://localhost:5000/api/health
- Client: http://localhost:5173

## Test

```bash
npm test
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs server (:5000) and client (:5173) concurrently |
| `npm run lint` | Lints the whole monorepo with ESLint |
| `npm run format` | Formats all files with Prettier |
| `npm test` | Runs the server test suite (Vitest) |
