# Milestone 0 — Monorepo + Tooling Setup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **For this learning project:** the human writes the code/commands; the assistant teaches each concept first, then quizzes at the end of the milestone.

**Goal:** Stand up a TypeScript monorepo (npm workspaces) with `/client`, `/server`, and `/packages/types`, plus shared tooling (ESLint, Prettier, base TS config), so every later milestone has a clean, consistent foundation that runs with one command.

**Architecture:** npm workspaces host three packages. `/packages/types` holds shared DTO types imported by both ends. `/server` runs Express on `tsx` in dev. `/client` is a Vite React-TS app with Tailwind. Root scripts orchestrate both via `concurrently`.

**Tech Stack:** npm workspaces, TypeScript 5, ESLint 9 (flat config) + Prettier, Vite 5, React 18, Tailwind CSS 3, Express 4, tsx, Vitest + Supertest.

## Global Constraints

- TypeScript end-to-end; no plain `.js` source files in `/client` or `/server` `src`.
- Node.js >= 20 (LTS) required (Vite 5 + ESLint 9 floor).
- Monorepo via npm workspaces (no pnpm/yarn) — keeps tooling answers interview-portable.
- Every workspace has its own `tsconfig.json` extending a root `tsconfig.base.json`.
- Secrets only via `.env`; never commit `.env`. Each workspace ships a committed `.env.example`.
- Commit after each task with a conventional-commit message.

---

## File Structure (created in this milestone)

```
/                         root workspace
  package.json            workspaces + orchestration scripts
  tsconfig.base.json      shared compiler options
  .gitignore .editorconfig .prettierrc eslint.config.js
  /packages/types         shared DTO types (@app/types)
    package.json tsconfig.json src/index.ts
  /server                 Express API (@app/server)
    package.json tsconfig.json .env.example
    src/index.ts src/app.ts
    test/health.test.ts
  /client                 Vite React app (@app/client)
    (Vite scaffold) + tailwind wiring
```

---

### Task 1: Root workspace + shared tooling

**Files:**
- Create: `package.json`, `tsconfig.base.json`, `.gitignore`, `.editorconfig`, `.prettierrc`, `eslint.config.js`

**Interfaces:**
- Produces: npm workspaces `packages/*`, `server`, `client`; root scripts `dev`, `lint`, `format`, `test`; base TS config at `./tsconfig.base.json` for workspaces to extend.

- [ ] **Step 1: Create the root `package.json`**

```json
{
  "name": "mern-ecommerce",
  "private": true,
  "version": "0.1.0",
  "workspaces": ["packages/*", "server", "client"],
  "scripts": {
    "dev": "concurrently -n server,client -c blue,green \"npm:dev -w server\" \"npm:dev -w client\"",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "npm run test -w server"
  },
  "devDependencies": {
    "concurrently": "^9.1.0",
    "eslint": "^9.17.0",
    "typescript-eslint": "^8.18.0",
    "prettier": "^3.4.2",
    "typescript": "^5.7.2"
  }
}
```

- [ ] **Step 2: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  }
}
```

- [ ] **Step 3: Create `.gitignore`**

```gitignore
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
coverage/
```

- [ ] **Step 4: Create `.editorconfig`**

```ini
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
```

- [ ] **Step 5: Create `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 6: Create `eslint.config.js` (flat config)**

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/build/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
```

- [ ] **Step 7: Install root dev dependencies**

Run: `npm install`
Expected: `node_modules/` appears; no errors. (`@eslint/js` is bundled with `eslint`.)

- [ ] **Step 8: Verify lint runs (no source yet = no errors)**

Run: `npx eslint . || echo "eslint ran"`
Expected: command completes without crashing.

- [ ] **Step 9: Commit**

```bash
git add package.json tsconfig.base.json .gitignore .editorconfig .prettierrc eslint.config.js package-lock.json
git commit -m "chore: scaffold npm-workspaces monorepo with eslint/prettier/tsconfig"
```

---

### Task 2: Shared types package (`@app/types`)

**Files:**
- Create: `packages/types/package.json`, `packages/types/tsconfig.json`, `packages/types/src/index.ts`

**Interfaces:**
- Produces: package `@app/types` exporting `Role` (`'user' | 'admin'`) and `ApiError` (`{ message: string; code?: string }`); imported by both server and client in later milestones.

- [ ] **Step 1: Create `packages/types/package.json`**

```json
{
  "name": "@app/types",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

- [ ] **Step 2: Create `packages/types/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist", "noEmit": true },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `packages/types/src/index.ts`**

```ts
export type Role = 'user' | 'admin';

export interface ApiError {
  message: string;
  code?: string;
}
```

- [ ] **Step 4: Re-link workspaces so `@app/types` resolves**

Run: `npm install`
Expected: completes; `@app/types` is symlinked into root `node_modules/@app/types`.

- [ ] **Step 5: Commit**

```bash
git add packages/types
git commit -m "feat(types): add shared @app/types package"
```

---

### Task 3: Server skeleton with health endpoint + smoke test

**Files:**
- Create: `server/package.json`, `server/tsconfig.json`, `server/.env.example`, `server/src/app.ts`, `server/src/index.ts`, `server/test/health.test.ts`

**Interfaces:**
- Consumes: `@app/types`.
- Produces: `createApp()` returning a configured Express `app` (exported from `server/src/app.ts`); `GET /api/health` -> `200 { status: 'ok' }`.

- [ ] **Step 1: Create `server/package.json`**

```json
{
  "name": "@app/server",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json && echo built",
    "start": "node dist/index.js",
    "test": "vitest run"
  },
  "dependencies": {
    "@app/types": "*",
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^22.10.2",
    "supertest": "^7.0.0",
    "@types/supertest": "^6.0.2",
    "tsx": "^4.19.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `server/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist", "types": ["node"] },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `server/.env.example`**

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

- [ ] **Step 4: Install the new workspace deps**

Run: `npm install`
Expected: express, tsx, vitest, supertest installed under the workspace.

- [ ] **Step 5: Write the failing test**

Create `server/test/health.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(createApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
```

- [ ] **Step 6: Run the test to confirm it fails**

Run: `npm run test -w server`
Expected: FAIL — cannot find module `../src/app`.

- [ ] **Step 7: Create `server/src/app.ts` (minimal implementation)**

```ts
import express, { type Express } from 'express';
import cors from 'cors';

export function createApp(): Express {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? '*', credentials: true }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
}
```

- [ ] **Step 8: Create `server/src/index.ts` (entry point)**

```ts
import 'dotenv/config';
import { createApp } from './app';

const port = Number(process.env.PORT ?? 5000);
createApp().listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
```

- [ ] **Step 9: Run the test to confirm it passes**

Run: `npm run test -w server`
Expected: PASS (1 test).

- [ ] **Step 10: Manually verify the dev server boots**

Run: `npm run dev -w server`
Expected: logs `API listening on http://localhost:5000`. Open `http://localhost:5000/api/health` -> `{"status":"ok"}`. Stop with Ctrl+C.

- [ ] **Step 11: Commit**

```bash
git add server
git commit -m "feat(server): express skeleton with health endpoint and smoke test"
```

---

### Task 4: Client scaffold (Vite + React + TS + Tailwind)

**Files:**
- Create: `client/` (Vite scaffold), then add `client/tailwind.config.js`, `client/postcss.config.js`, edit `client/src/index.css`, `client/src/App.tsx`

**Interfaces:**
- Produces: a Vite dev server on `:5173` rendering a Tailwind-styled page; npm script `dev` in `client/package.json`.

- [ ] **Step 1: Scaffold the Vite React-TS app into `client/`**

Run: `npm create vite@latest client -- --template react-ts`
Expected: `client/` created with React + TS template.

- [ ] **Step 2: Set the client package name so workspaces pick it up**

Edit `client/package.json` — set `"name": "@app/client"` (keep the generated scripts/deps).

- [ ] **Step 3: Install Tailwind toolchain**

Run: `npm install -D tailwindcss@^3.4.17 postcss@^8.4.49 autoprefixer@^10.4.20 -w client`
Then: `npm install` (re-link workspaces)
Expected: tailwind installed under `client`.

- [ ] **Step 4: Create `client/tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

- [ ] **Step 5: Create `client/postcss.config.js`**

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 6: Replace `client/src/index.css` with Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: Replace `client/src/App.tsx` with a Tailwind smoke screen**

```tsx
function App() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
      <h1 className="text-4xl font-bold tracking-tight">
        Shop<span className="text-emerald-400">MERN</span> — setup OK
      </h1>
    </main>
  );
}

export default App;
```

- [ ] **Step 8: Run the client dev server and verify Tailwind works**

Run: `npm run dev -w client`
Expected: Vite serves `http://localhost:5173`; page shows the heading on a dark slate background with an emerald accent (proves Tailwind compiled). Stop with Ctrl+C.

- [ ] **Step 9: Commit**

```bash
git add client
git commit -m "feat(client): vite react-ts scaffold with tailwind"
```

---

### Task 5: Root orchestration + README

**Files:**
- Create: `README.md`
- Verify: root `dev` script runs both workspaces together

**Interfaces:**
- Produces: `npm run dev` from root boots server (:5000) and client (:5173) concurrently.

- [ ] **Step 1: Create `README.md`**

```markdown
# ShopMERN — MERN E-Commerce (TypeScript) Learning Project

Monorepo (npm workspaces): `client/`, `server/`, `packages/types/`.

## Prerequisites
- Node.js >= 20
- A MongoDB connection string (added in Milestone 1)

## Install
\`\`\`bash
npm install
\`\`\`

## Develop (runs API + client together)
\`\`\`bash
npm run dev
\`\`\`
- API: http://localhost:5000/api/health
- Client: http://localhost:5173

## Test
\`\`\`bash
npm test
\`\`\`
```

- [ ] **Step 2: Run both apps from the root**

Run: `npm run dev`
Expected: `concurrently` shows `server` logging the API port and `client` serving Vite. Both URLs respond. Stop with Ctrl+C.

- [ ] **Step 3: Run lint across the monorepo**

Run: `npm run lint`
Expected: completes with no errors (warnings acceptable).

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add project README and verify root dev orchestration"
```

---

## Self-Review

**Spec coverage (Milestone 0 row + stack §2):** monorepo workspaces (Task 1), shared `/packages/types` (Task 2), server TS skeleton (Task 3), Vite+React+TS+Tailwind client (Task 4), ESLint/Prettier/env/root-scripts (Tasks 1 & 5). All covered.

**Placeholder scan:** none — every file has complete content; every command has expected output.

**Type consistency:** `createApp()` defined in Task 3 Step 7 and consumed in Task 3 Step 5 test; `@app/types` package name consistent across Tasks 2/3; `@app/client`/`@app/server` names consistent with root `workspaces` globs.

**Deferred to Milestone 1 (intentionally):** MongoDB/Mongoose connection, env loading for DB, centralized error handler. Listed in spec Milestone 1, not Milestone 0.
```
