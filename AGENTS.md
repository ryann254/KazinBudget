# AGENTS.md - Autonomous Agent Commands

Token-efficient commands. Output failures only.
User preferences and explicit requests come first.

## Required Skills

| Situation | Skill | Trigger |
|-----------|-------|---------|
| Claiming "done", "fixed", "passes" | `/verification-before-completion` | Evidence before claims |
| Bug found, need to fix | `/systematic-debugging` | Root cause first, no guessing |
| Adding new feature/function | `/test-driven-development` | Failing test first |
| Before commit/PR | `/requesting-code-review` | Self-review catches issues |
| Receiving code feedback | `/receiving-code-review` | Technical rigor, not blind acceptance |

## Technology Skills

| Stack | Skill |
|-------|-------|
| React + Vite |
| Convex |
| TanStack Router | `/tanstack-router` |
| Forms + Zod | `/react-hook-form-zod` |
| Tailwind + shadcn | `/tailwind-v4-shadcn` |
| shadcn components | `/shadcn-ui` |
| React patterns | `/vercel-react-best-practices` |
| E2E tests | `/e2e-testing-patterns` |
| Browser automation | `/agent-browser` |
| TypeScript | `/typescript-advanced-types` |
| UI/UX audit | `/web-design-guidelines` |

## Verification Commands
```bash
# Quick checks (filtered output)
pnpm typecheck 2>&1 | grep -E "error TS" | head -20 || echo "OK"
pnpm lint 2>&1 | grep -E "(error|warn)" | head -20 || echo "OK"
pnpm build 2>&1 | grep -E "(error|Error|failed)" || echo "OK"
pnpm circular 2>&1 | grep -v "^$" | head -10
pnpm deadcode 2>&1 | head -20 || echo "OK"

# Full pre-commit (NEVER skip)
pnpm format && pnpm lint && pnpm typecheck && pnpm circular && pnpm deadcode && pnpm build && \
pnpm test:unit && pnpm test:e2e && echo "PASS" || echo "FAIL"
```

## Tests
```bash
# Unit (all)
pnpm test:unit --reporter=dot 2>&1 | grep -E "(FAIL|Error|✗)" || echo "OK"

# Unit (by package)
pnpm test:unit -- packages/api --reporter=dot 2>&1 | grep -E "(FAIL|Error|✗)" || echo "OK"
pnpm test:unit -- packages/shared --reporter=dot 2>&1 | grep -E "(FAIL|Error|✗)" || echo "OK"

# E2E (NEVER skip)
pnpm test:e2e --reporter=line 2>&1 | grep -E "(failed|Error|✗)" | head -20
```

### Services
| Service | Port | Description |
|---------|------|-------------|
| API | 3210 | Convex server |
| Web | 5173 | Vite React frontend |

### Quick Start
```bash
# First time setup (install packages, start up frontend and backend)
pnpm install
pnpm run dev && pnpm convex dev

# Start all services
pnpm run dev && pnpm convex dev

# Stop services (keeps containers)
Control + C
```

### Runtime Verification (MANDATORY)

**Before ANY commit, verify services are healthy:**

```bash
# Check all services running
# API check - make sure the CLI says the instance is "Ready"
curl -sf http://localhost:3210/ >/dev/null && echo "✓ API OK" || echo "✗ API DOWN"

# Web health check
curl -sf http://localhost:5173/ >/dev/null && echo "✓ Web OK" || echo "✗ Web DOWN"

### When to Run Runtime Verification

| Changed Files | Action |
|---------------|--------|
| `src/**` | ALL runtime checks |
| `*.md`, `openspec/` | Skip runtime (static checks only) |
| `*.test.ts`, `e2e/` | Skip runtime (tests are the verification) |

### The Contract
1. **If API/S is down** → You broke something → Fix it before commit
2. **If logs show errors** → You introduced a bug → Fix it before commit
3. **NO EXCUSES** → Don't commit with runtime errors visible in logs

### Useful URLs
- **API**: http://localhost:3210
- **Web**: http://localhost:5173

## Git
```bash
# Check before starting work
git status

# Review changes before commit
git diff --stat

# Commit after ALL tests pass (conventional commit format)
git add -A && git commit -m "type(scope): description"
```

### Commit Message Format

Format: `type(scope): description`

**Allowed types:**
| Type | When to use |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change without feature/fix |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build, tooling, dependencies |
| `revert` | Reverting a previous commit |

**Allowed scopes:**
| Scope | What it covers |
|-------|----------------|
| `agent` | Agent loop, context, LLM integration |
| `tools` | Tool implementations (web, file, code, etc.) |
| `memory` | Memory system, embeddings, recall |
| `api` | convex, middleware |
| `web` | React frontend, components, routing |
| `auth` | Authentication, authorization |
| `docs` | Documentation files (README, AGENTS.md) |
| `infra` | Build config, CI/CD, scripts |
| `test` | Test infrastructure, utilities |
| `config` | Config files (tsconfig, biome, etc.) |

**Examples:**
```bash
# Good
feat(agent): add streaming response handler
fix(api): handle missing auth header gracefully
test(memory): add property tests for embeddings
chore(infra): update biome to v1.9

# Bad - avoid these patterns
feat: add feature                    # Missing scope
feat(api): Add New Feature           # Don't capitalize
feat(api): added endpoint            # Use imperative mood
fix(api): fix bug                    # Be specific
```

### CRITICAL: Pre-commit Rules
- **NEVER use `--no-verify`** - This flag is BANNED. No exceptions.
- **NEVER skip hooks** - If pre-commit fails, FIX the issues.
- **Fix ALL issues** - Even if issues are "not related to your changes", you must fix them before committing.
- **No excuses** - "Pre-existing issue" or "not my code" is NOT a valid reason to skip.
- If you cannot fix the issues, STOP and ask the user for help. Do NOT bypass with `--no-verify`.

## Pattern Checks

The `scripts/check-patterns.sh` enforces three architectural patterns. Run with:
```bash
./scripts/check-patterns.sh
# Or via pnpm (added to pre-commit)
pnpm patterns
```

### Checks Performed

| # | Check | Why |
|---|-------|-----|
| 1 | No barrel exports (`export * from` in index.ts) | Prevents circular deps, improves tree-shaking |
| 2 | No default exports (`export default`) | Forces consistent named imports |
| 3 | Centralized env access (`process.env`, `import.meta.env`) | Single source of truth for config |

### Allowed Exceptions

| Pattern | Exception | Reason |
|---------|-----------|--------|
| Default exports | `*.d.ts` files | TypeScript type definitions may require it |
| Default exports | `*.test.ts`, `*.spec.ts` | Test utilities sometimes need it |
| Env access | Files named `env.ts` | Designated environment config file |
| Env access | Test files (`*.test.ts`, `*.spec.ts`) | May check CI environment |
| Env access | E2E tests (`e2e/*.ts`) | May check CI for skip conditions |

### Manual Quick Checks
```bash
# Must return nothing
find packages -name "index.ts" -exec grep -l "export \* from" {} \;  # NO barrel exports
grep -r "export default" packages/ --include="*.ts" --include="*.tsx" | head -5  # NO default exports
grep -r "import.meta.env\." packages/ --include="*.ts" | grep -v "env.ts"  # Centralized env
grep -r "process.env\." packages/ --include="*.ts" | grep -v "env.ts"  # Centralized env

## Troubleshooting
```bash
# Reinstall dependencies
rm -rf node_modules dist && pnpm install
prek install
pnpm exec playwright install --with-deps

## Specs
- `openspec/project.md` (conventions)
- `openspec/specs/*/spec.md` (requirements)
- `openspec/changes/*/tasks.md` (pending work)

## Known Constraints
- **Zod**: Import from `zod` (latest)
- **TanStack Router**: `<Link>` not `<a>` (preserves state)
- **No barrel exports**: Import directly from files
- **No default exports**: Named exports only
- **Pre-commit runs E2E**: NEVER skip tests, NEVER use `--no-verify`
- **Fix pre-existing issues**: If hooks fail on code you didn't write, FIX IT anyway
- **Reference implementation**: Check `../openclaw/` for patterns
- **Local Docker**: Use `make run-dev` to start all services

## Live Testing Skills
| Task | Skill |
|------|-------|
| Browser automation | `/agent-browser` |
| UI verification | `/webapp-testing` |
