# Feature: Sign In (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Let an existing user log in and reach their dashboard.

## Scope
- Page: `app/(auth)/login/page.tsx`
- Fields: email, password.
- On success → store token, redirect based on role (user → my-documents,
  admin → admin users list).
- On failure → generic "invalid credentials" message.
