# AGENTS.md

## 1. Purpose

This file defines the mandatory execution harness for all agents in this repository.

The harness applies to every task type: read-only, advisory, planning, docs-only, config, and code changes.

No task is exempt.

This repository is an actively evolving scaffold. Do not add legacy aliases, backward-compatibility shims, fallback keys, or dual-contract behavior unless a scoped human break-glass override is recorded.

Always use this file when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use this file to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Review `@SKILL.md` and `@openspec/design-doc/design.md` before making design changes.

Refer to the openspec/ folder, use subagents to research the .md files to see the work that needs to be done. Once satisfied, launch subagents to implement the tasks in the tasks.md for each folder, each subagent will do one task in the tasks.md file, then when done, mark that task as complete, kill the subagent then spawn a new one for the next task


## 2. Precedence

Follow instructions in this order:

1. `AGENTS.md` (authoritative contract)
2. Explicit, scoped human break-glass override recorded in `docs/IMPLEMENTATION_STATE.md`
3. `openspec/project.md` and relevant feature docs under `openspec/**/design.md` + `openspec/**/tasks.md`
4. `CLAUDE.md` (operational pointer; lower precedence than this file)

If instructions conflict, follow the highest-precedence source unless a valid break-glass entry exists.

## 3. Mandatory Sources

For each task, the agent must consult all applicable sources:

1. `AGENTS.md`
2. `openspec/project.md`
3. Relevant `openspec/<feature>/design.md`
4. Relevant `openspec/<feature>/tasks.md`
5. For Convex work: `convex/**` source files and generated contract in `web/.env.local`

## 4. Task Unit, Sequencing, and Progression

1. Only one task may be active at a time.
2. If a milestone ID exists in OpenSpec tasks, use it.
3. If no milestone ID exists, create sequential task IDs: `T001`, `T002`, `T003`, ...
4. Before implementation, add a task-start entry to `docs/IMPLEMENTATION_STATE.md` (create file if missing).
5. Complete all applicable verification gates for the current task.
6. If all required gates pass, record agent self-approval in `docs/IMPLEMENTATION_STATE.md`.
7. Commit only after verification passes and approval is recorded.
8. Start the next task only after the current task is completed and logged.
9. Human review is optional unless explicitly requested.
10. If task work is not represented in OpenSpec tasks, add/patch OpenSpec task entries before implementation.

## 5. `docs/IMPLEMENTATION_STATE.md` Required Schema

Every state update must use this exact field order:

1. `Timestamp` (ISO-8601)
2. `Task ID`
3. `Phase` (`intake`, `implementation`, `verification`, `handoff`, `approval`, `commit`, `blocked`)
4. `Summary`
5. `Files Touched` (`none` if read-only)
6. `Commands Run` (include exit status and key output)
7. `Verification Matrix` (each gate: `pass`, `fail`, or `na` with reason)
8. `Evidence` (artifact paths, routes checked, screenshots)
9. `Approval Record` (agent self-approval or human approval/override)
10. `Next Step`

Minimum update points:

1. Task start
2. After each major implementation step
3. Before verification
4. After each verification batch
5. At approval
6. At commit
7. At least every 10 minutes during long-running work

## 6. Verification Applicability Matrix

For every task, classify impact and run all required gates. Any skipped gate must be recorded as `na` with explicit reason.

Include `legacy_backcompat_check` for all applicable tasks:

1. `pass`: no legacy aliases/fallbacks/shims introduced
2. `fail`: any legacy/back-compat artifact introduced in touched scope
3. `na`: task scope cannot affect runtime/API/config contract; include reason

### 6.1 Docs-Only / Read-Only / Advisory Tasks

1. Runtime and code execution gates may be `na`.
2. `IMPLEMENTATION_STATE.md` must document explicit `na` reasons.

### 6.2 Code or Config Tasks (Non-Convex)

Run:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

### 6.3 Convex-Touching Tasks

A task is Convex-touching if it changes `convex/**`, Convex deployment binding, or backend contract behavior.

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
cd web && npx convex dev --once
```

If the change affects production behavior, also run:

```bash
cd web && npx convex deploy -y
```

### 6.4 UI or Live Runtime Tasks

A task is UI/live-runtime-touching if it affects `web/**` user-visible behavior.

Run:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Then run manual headed verification (or `agent-browser`) for affected routes and capture screenshots.

### 6.5 Cross-Cutting Tasks (Convex + UI)

Run all applicable gates from 6.3 and 6.4.

### 6.6 Test Coverage Rules (Mandatory)

1. Any implementation task must add or update tests for changed behavior.
2. Shared/domain logic changes in `shared/**` require unit tests under existing Vitest suites.
3. If UI behavior changes and no automated UI test harness exists, record manual verification evidence with screenshots and exact flows.
4. Do not claim `passWithNoTests` for implementation tasks unless a scoped break-glass override is logged.
5. For user-critical flows touched by the task, verification must cover both success and failure behavior (automated tests preferred; manual evidence allowed when no framework exists).

## 7. Convex Runtime Gate (Mandatory for Convex Tasks)

Before approving any Convex-touching task:

1. Confirm Convex CLI authentication is valid in current shell.
2. Confirm deployment target in `web/.env.local` matches intended project.
3. Run `cd web && npx convex dev --once` and log result.
4. If production delivery is part of scope, run `cd web && npx convex deploy -y` and log deployment URL.
5. Record deployment evidence in `docs/IMPLEMENTATION_STATE.md`.

## 8. Browser Evidence Policy

1. Save browser artifacts under `.artifacts/`.
2. Use file naming: `.artifacts/<task-id>-<label>.png`.
3. Do not commit `.artifacts/` by default.
4. Record artifact paths in `docs/IMPLEMENTATION_STATE.md`.

## 9. Approval and Commit Protocol

1. No commit before required verification passes.
2. Approval must be recorded in `docs/IMPLEMENTATION_STATE.md` before commit.
3. Default approval source is agent self-approval after successful verification.
4. Human approval is optional unless explicitly requested.
5. Create one commit per approved task.
6. Commit message format:

```text
<type>(<scope>): <description>
```

7. Record commit hash in `docs/IMPLEMENTATION_STATE.md`.
8. Move to next task only after commit record is logged.

Allowed commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`.

Preferred scopes: `web`, `convex`, `shared`, `docs`, `infra`, `config`, `test`.

## 10. Break-Glass Override Protocol

A bypass is allowed only when all are true:

1. Human explicitly requests override.
2. Override is scoped to a specific task and specific gate/rule.
3. Agent logs in `docs/IMPLEMENTATION_STATE.md`:
   1. Timestamp
   2. Task ID
   3. Rule/gate bypassed
   4. Scope
   5. Human-stated reason
4. All non-overridden rules remain mandatory.

## 11. Failure and Blocker Protocol

1. If any required gate fails, do not commit.
2. Log failure evidence and likely root cause in `docs/IMPLEMENTATION_STATE.md`.
3. Apply fix and re-run all affected gates.
4. If blocked on external dependency or human stop instruction, set phase to `blocked`, record unblock condition, and pause.

## 12. Task Completion Criteria

A task is complete only when all are true:

1. Scope is implemented.
2. Applicable verification gates passed (or `na` with valid reason).
3. Manual/browser verification done for UI/runtime changes.
4. Evidence captured in `docs/IMPLEMENTATION_STATE.md`.
5. Approval record exists.
6. `legacy_backcompat_check` is `pass` (or justified `na`).
7. Approved task commit is created and logged.

## 13. Harness Validation Scenarios

The harness must remain workable for:

1. Docs-only task: schema-compliant state entries, non-applicable gates marked `na`.
2. Convex-only task: Convex runtime gate completed, verification logged, approval + commit recorded.
3. UI/runtime task: standard checks pass, affected routes manually verified, screenshot evidence logged.
4. Multi-task request: tasks executed one-at-a-time with independent verification + approval + commit.
5. Break-glass request: only scoped gates bypassed; all other gates enforced.

## 14. Locked Defaults

1. Harness applies to all tasks, including advisory/read-only work.
2. Verification follows applicability matrix with explicit `na` reasons.
3. One-task-at-a-time progression is mandatory.
4. `CLAUDE.md` is not a higher-precedence contract than `AGENTS.md`.
5. Never use `--no-verify` to bypass hooks.
6. Never skip failing verification gates without explicit break-glass.
7. No default exports in application/shared source unless technically required (config files and framework-required exceptions allowed).
8. No barrel `export *` patterns in new/changed modules.
9. Avoid direct environment contract sprawl; keep runtime env usage explicit and minimal.
10. `.env.local` remains local/deployment metadata and must not be treated as a committed source of truth.
