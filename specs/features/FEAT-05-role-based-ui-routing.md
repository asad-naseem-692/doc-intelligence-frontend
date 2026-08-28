# Feature: Role-Based UI Routing
**Owner:** Frontend | **Module:** Authentication

## Goal
Show each user only the screens meant for their role.

## Scope
- Regular users see document upload/query screens.
- Admins additionally see the admin users panel.
- Route guard redirects unauthenticated visitors to `/login`.
