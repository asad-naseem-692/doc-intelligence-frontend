# Feature: Auth Token Storage & Attachment (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Keep the session available across pages and attach it to every API call.

## Scope
- `lib/auth.ts`: save/read/clear token after login.
- `lib/api.ts`: every request adds `Authorization: Bearer <token>`.
- On `401` response: clear token, redirect to `/login`.
