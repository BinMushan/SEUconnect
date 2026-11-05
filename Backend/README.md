# SEUConnect Backend

Node.js · Express 5 · Mongoose 9 · **MongoDB Atlas** · JWT. Design and rules: [`docs/backend/ARCHITECTURE.md`](../docs/backend/ARCHITECTURE.md).

## Run

```bash
cp .env.example .env        # then fill MONGODB_URI and JWT_SECRET
npm install
npm start                   # http://localhost:5000
```

On start the server connects to Atlas, syncs the role/permission catalogue, creates the faculty structure
(DICT/DBST, BICT/BBST, SWT/NST, AAT/AEE/BSE/CST/FST) and default policies, applies migrations, and - in
development only - creates demo accounts and demo academic data (`SEED_DEMO_DATA`). If Atlas cannot be reached the
examination-form workflows keep running in in-memory demo mode; the academic API (`/api/v1`) answers `503`.

Atlas needs your IP in **Network Access**. On networks whose DNS cannot resolve `*.mongodb.net`, the app falls back to
public DNS for Atlas host names automatically.

## Two APIs

| Prefix | Purpose |
|---|---|
| `/api/*` | The five examination-form workflows (ECA, ESA, Examination Form, Subject / Examination Medical) used by the current frontend. |
| `/api/v1/*` | Academic management: auth, users/roles, organisation, students, staff, courses, offerings, registration, allocation, attendance, assessment, ESA, results/GPA, requests, notifications, reports, audit. |

`/api/v1` responses: `{ success, data, meta? }`; errors: `{ success:false, message, error:{ code, details? } }`.
Lists accept `?page&limit&sort&q` plus module filters.

## Security model

* Passwords hashed with scrypt; accounts lock after repeated failures; access token 15 min + rotating refresh token;
  changing a password or suspending an account signs the user out everywhere.
* **Every** protected route checks a permission on the server (`core/rbac.js`). Permissions carry a scope
  (`own < assigned < department < faculty < system`) that is turned into data filters (`core/scope.js`).
* Academic records are archived, never deleted; changes are written to an append-only audit log.
* Academic rules (credit limit, pass marks, grade bands, selection criteria ...) are **policies in the database**
  (`/api/v1/policies`). Values the specification only gives as examples are seeded as `pending_confirmation`;
  engines that would otherwise guess (grade bands, selection weights) refuse to run until a policy is approved.

## Tests

```bash
npm run test:unit           # pure logic, no database
npm run test:integration    # real API on a throw-away database on your Atlas cluster (dropped afterwards)
npm test                    # everything + the examination-workflow suite
```

## Operations

`npm run migrate` applies pending migrations (also automatic on start) · `npm run backup` exports collections to
`backups/` (Atlas cloud backups remain the primary backup strategy).

## AI assistant (role agents + RAG + LLM)

`/api/v1/assistant` - one agent per role. The server decides who is asking from the login token; the browser cannot
choose a role. Each agent gets **only** the tools its role's permissions allow (they run through the normal services, so
data scopes apply) and **only** the knowledge documents whose audience includes the role.

| Part | Where | Notes |
|---|---|---|
| Agents | `modules/assistant/agents.js` | persona + starter questions per role |
| Tools | `modules/assistant/tools.js` | `my_gpa`, `my_attendance`, `pending_actions`, `student_overview` ... gated by permission |
| RAG | `modules/assistant/rag.js` | chunking, BM25 keywords + Gemini embeddings, filtered by role; `/api/v1/knowledge` to manage documents |
| LLM | `modules/assistant/llm.js` | Gemini with function calling, two model tiers with fallback and cooldowns |

**Models** (override with env vars; chosen from what the project's key can call):
`GEMINI_MODELS_FAST` = `gemini-3.1-flash-lite, gemini-flash-lite-latest, gemini-3.5-flash-lite` for short knowledge questions;
`GEMINI_MODELS_SMART` = `gemini-3.5-flash, gemini-3.6-flash, gemini-3-flash-preview` for questions that need the user's
data or several steps; `GEMINI_EMBED_MODEL` = `gemini-embedding-001` (256 dimensions). A request tries its tier, then the
other; a failing model is skipped for a while. Without `GEMINI_API_KEY` the assistant still answers from tools and
documents (rule-based mode).

`npm run kb:reindex` rebuilds all chunks and embeddings (run after changing the key or embedding model).
Built-in regulation documents are stored as `needs_confirmation` until an administrator confirms them against the
Faculty Handbook; answers say so.
