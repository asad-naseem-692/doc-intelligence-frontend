# Feature: Sign Up (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Let a new user create an account.

## Scope
- Page: `app/(auth)/signup/page.tsx`
- Fields: name, email, password, confirm password.
- Client-side validation only (required fields, email format, password match).
- On submit → POST to backend signup, redirect to login on success.
