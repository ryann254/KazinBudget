# WorkPlace Budgeting - Project Conventions

Simple web app to help new job seekers understand their salaries(salary - expenses = actual take home salary).

## Overview

WorkPlace Budgeting is a simple web app/tool that allows new and existing job seekers to understand they actual take home salary. It give users the ability to enter their name, company, company location, where they live, salary, and with that information it scrapes and gathers information and spits out the actual take home salary after deducting the expenses

## Architecture

- **Frontend**: Vite + React SPA with TailwindCSS and shadcn/ui
- **Server**: Convex
- **Database**: Convex DB

## Core Features

- Instant calculation of take home pay, taxes and expenses
- Dashboards to track where your money goes
- Dashboards to track 10-Year Salary Projection and Taxes vs Take home
- Comparison to show how much you're getting paid vs the market rate for someone with your experience.

## Code Conventions

### TypeScript
- Strict mode enabled
- Use Zod for runtime validation
- Prefer `const` assertions and `as const`
- Use `type` over `interface` for consistency

### API Design
- RESTful endpoints under `/api/`
- Consistent error responses with status codes

### Database
- UUID primary keys
- snake_case column names
- Timestamps: `created_at`, `updated_at`
- Soft delete where appropriate

### File Organization
```
packages/
├── convex/           # Convex service
│   ├── api/
│   │   ├── routes/
│   │   ├── tools/
│   │   └── db/
├── web/           # Vite + React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── stores/
│   │   └── lib/
└── shared/        # Shared types and utilities
```

## Security

- Path traversal prevention on all file operations
- Input sanitization on all user content
- Audit logging for sensitive operations

## Testing

- Vitest for unit and integration tests
- Playwright for E2E tests
- Test coverage targets: 80% for core agent logic

## Environment

- Node.js 20+
- Convex
