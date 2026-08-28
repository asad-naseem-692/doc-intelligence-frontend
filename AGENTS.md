# AGENTS.md — Frontend (Next.js) — AI Document Intelligence System

## Scope
This file applies to the `frontend/` folder only. Deploys to Vercel. A
sibling `backend/AGENTS.md` covers the backend.

## Tech stack (do not substitute)
Next.js (App Router) + TypeScript + Tailwind CSS.

## Build order — full-stack, one feature at a time
Same as Project 2: vertical slices pairing backend + frontend specs, one
feature at a time, stop for approval after each. Follow
`specs/features/` in `FEAT-XX` numeric order.

## Core invariant
No business logic here. Text extraction, chunking, embeddings, retrieval,
answer generation, and confidence checks all happen on the backend. This
frontend only sends requests (upload a file, ask a question) and renders
whatever the backend returns — including citations and fallback messages
exactly as given, never inventing its own.

## Hard rules
- Never hardcode the backend URL — always read
  `process.env.NEXT_PUBLIC_API_BASE_URL`.
- All API calls go through one client module (`lib/api.ts`).
- Auth token attached automatically as a Bearer header.
- A document's "Processing" status should be polled, not assumed —
  don't let a user ask questions against a document that isn't "ready"
  yet.
- Fallback answers ("couldn't find enough information") must look
  clearly different from both a normal answer and an error — this is an
  expected, honest outcome, not a bug.

## Data dictionary — use exactly these field names, always
Same conventions as backend: `snake_case`, ISO 8601 timestamps, UUID ids.

- **User**: `id, name, email, role ("user"|"admin"), created_at`
- **Auth response**: `{ "access_token": string, "token_type": "bearer", "user": User }`
- **Document**: `id, filename, owner_id, status ("processing"|"ready"|"failed"), uploaded_at`
- **Citation**: `document_id, filename, chunk_index, excerpt`
- **QueryResponse**: `{ "answer": string, "citations": Citation[], "is_fallback": boolean }`
- **QAHistoryEntry**: `id, question, answer, citations, created_at`

If a feature needs a field not listed here, flag it in your summary so
it can be added to `backend/AGENTS.md` too.

## Keep specs and code in sync (mandatory, every time)
The spec file for a feature is the source of truth for what that feature
is supposed to do — not just a one-time planning document. Whenever you
add, change, or remove behavior in a feature after it's already been
built:
1. **Update that feature's `.md` file in `specs/features/` in the same
   change** — add/edit/remove the relevant bullet points so the spec
   still accurately describes the current behavior.
2. If the change affects what data the frontend expects from the
   backend (new field, changed endpoint, changed response shape), note
   that clearly in the spec so it's visible to whoever is working on the
   backend repo.
3. If a change doesn't fit any existing feature file, create a new
   `FEAT-XX-name.md` for it, following the same format as the others,
   rather than leaving the change undocumented.
4. Never let a spec describe behavior that no longer exists in the code,
   and never let the code do something its spec doesn't mention. Treat a
   stale or missing spec update as an incomplete task, not an optional
   cleanup step.

## Never let a change to one feature break a feature it depends on
Before changing a feature others rely on, check `specs/features/` for
anything referencing it. Update its spec explicitly if changed.

## What you set up yourself
`.env.example` / local `.env` (`NEXT_PUBLIC_API_BASE_URL`), `.gitignore`,
`package.json`, `Dockerfile` (optional, for local testing only — Vercel
builds natively).

## Deployment target
Vercel. `NEXT_PUBLIC_API_BASE_URL` set to the deployed backend's Railway
URL once known.
