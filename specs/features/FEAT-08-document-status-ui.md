# Feature: Document Status Display (UI)
**Owner:** Frontend | **Module:** Document Management

## Goal
Show whether a document is still being processed or ready to query.

## Scope
- Status badge: "Processing" (with spinner), "Ready" (green), "Failed" (red).
- Poll the document status endpoint every few seconds while "Processing".
