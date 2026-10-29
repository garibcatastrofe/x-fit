# X-FIT — Repository Instructions

## 1. Project identity and purpose
X-FIT is a multi-tenant gym-management platform in a pnpm monorepo.
- `frontend/`: Next.js application for screens, presentation, interactions, and consuming the backend API.
- `backend/`: NestJS REST API for authentication integration, authorization, business rules, validation, and persistence.
- Main domain areas: organizations/gyms, clients, memberships, payments, promotions, employees, attendance/check-ins, routines, diets, exercises, and foods.

The repository is the source of truth. Do not infer that a planned feature exists just because it is described here.

## 2. Source of truth
When sources conflict, use this order:
1. Current runtime implementation and observable behavior.
2. Tests that exercise the current implementation.
3. Package scripts, configuration, schemas, and generated API contracts.
4. Database schema and existing migrations.
5. These repository instructions.
6. An explicitly approved architecture plan.
7. Maintained documentation.
8. Historical notes and conversation memory.

Report contradictions instead of silently choosing a convenient interpretation. Distinguish `Current`, `Partially implemented`, `Target`, and `Undecided`.

## 3. Application boundaries
### Frontend owns
- Pages, layouts, UI, reusable components, styling, interactions, navigation, client-side state, forms, and presentation-level validation.
- Calling the backend API through the established API client/pattern, if one exists.
- Rendering loading, empty, success, and error states.

### Backend owns
- REST endpoints, authoritative input validation, authentication integration, authorization, organization scoping, business rules, transactions, persistence, and integration with external services.
- API contracts and server-side enforcement of permissions.

### Forbidden boundary violations
- The frontend must not connect directly to PostgreSQL/Prisma or bypass the backend for business operations.
- The frontend must not be treated as a security boundary. Hiding a button or route does not authorize an operation.
- The backend must not contain UI/presentation code.
- Do not move business rules into the frontend merely to simplify a request.
- Next.js server components/server actions do not authorize bypassing NestJS. Business operations still go through the backend API unless a human explicitly approves a different architecture.

## 4. Architecture and file placement
- Keep `frontend/src/app/` focused on route entry points and Next.js special files (`layout`, `loading`, `error`, `not-found`, route handlers when genuinely required). Keep feature implementation outside route files.
- Put domain-specific frontend code in `frontend/src/features/<feature>/` when that convention is established by the existing code. Put genuinely shared UI in shared components; do not create abstractions for one-off use without a clear benefit.
- Keep backend modules cohesive and domain-oriented. Follow existing NestJS module patterns before creating new ones.
- For a new backend resource, inspect nearby modules and use the existing NestJS conventions. Do not generate an entire resource scaffold if the task needs only one focused change.
- Preferred backend separation: controller handles HTTP mapping, service owns use-case/business orchestration, repository owns persistence queries. Inject dependencies through NestJS DI.
- Services should not directly import or depend on Prisma Client when a repository boundary is established. Do not add a repository that merely duplicates every Prisma method without providing isolation, domain queries, or testability.
- Do not instantiate services or repositories manually when NestJS DI should own their lifecycle.
- Keep dependency direction clear: route/controller → service/use case → repository/persistence. Shared utilities must not import feature modules back into themselves.

## 5. Runtime and technology facts
Verified from current package manifests:
- Monorepo uses pnpm workspaces: `frontend` and `backend`.
- Root scripts: `dev:frontend`, `dev:backend`, `build:frontend`, `build:backend`.
- Frontend: Next.js 16.4.2, React 19.3.0, TypeScript 5, ESLint 9, Tailwind CSS 4.
- Backend: NestJS 12, TypeScript 6, Prisma 7, PostgreSQL provider, Vitest 4, Oxlint, class-validator, class-transformer, Nest Swagger, and Scalar.
- Backend Prisma generator output is configured as `backend/src/generated/prisma`.
- Backend uses the Rspack builder in `nest-cli.json`.
- No test script is currently declared in the frontend package manifest.
- Do not assume Better Auth is installed or working: its use is a target decision, not a verified implementation fact.
- Do not assume CI exists. No CI configuration was shown in the repository audit.
- Do not assume Docker Compose configuration exists unless verified in the current repository.

These facts must be rechecked if manifests or configuration change.

## 6. Authentication, authorization, and organization isolation
- Intended direction: Better Auth handles authentication/session concerns (email/password, Google OAuth, email verification) once it is integrated and verified. NestJS remains responsible for authorizing each business API operation.
- Never claim that Better Auth, an organization plugin, a frontend guard, or a hidden control automatically secures every NestJS endpoint.
- For organization-owned data, scope reads and writes to the authenticated user's authorized organization context. Never trust an organization ID supplied by the client without checking membership and permissions on the server.
- Prevent cross-organization reads, writes, updates, deletes, and indirect references. Include tenant-isolation tests for relevant endpoints.
- If membership across multiple gyms, platform-level roles, ownership transfer, invitations, or role/permission semantics affect the requested work and are not defined by current code or an approved decision, stop and ask the human.
- Do not invent authorization policy, account lifecycle, deletion, retention, refund, or membership state-transition rules.

## 7. Validation and configuration
- Validate untrusted input at the backend boundary using the repository's established validation pipeline. Inspect `main.ts`, pipes, DTOs, and module configuration before changing validation behavior.
- Validate required environment configuration at startup where the project pattern supports it. Document required variable names in `.env.example`; never copy real secrets into source control.
- `NEXT_PUBLIC_*` variables are public. Never place secrets in them.
- Do not invent environment variable names, defaults, API prefixes, CORS origins, or documentation URLs. Inspect runtime configuration first.
- Keep generated Prisma client files generated; do not hand-edit them. Change the Prisma schema/configuration only when the approved task requires it.

## 8. Persistence and schema changes
- PostgreSQL is the intended primary relational database; Prisma is the current ORM dependency. Confirm actual runtime wiring before asserting the database is connected.
- Keep database queries in the repository/persistence boundary when that pattern is in place.
- Use transactions when a use case must maintain a consistent state across multiple database operations.
- Do not change schema, migration files, database state, generated clients, or seed data as an incidental cleanup.
- Before any Prisma schema change or migration-related operation, explain the proposed change, command, target environment, effects, and risks, then request explicit human approval.
- This approval is required for creating or applying migrations, `prisma db push`, migration resolve/rollback/reset operations, and any command that changes database schema or migration state. Approval for one command does not authorize subsequent commands.
- Never run a reset or destructive database operation as generic validation.
- Seeders can insert, update, or delete data: treat them as data-changing operations requiring explicit approval, including in development.

## 9. Integrations and roadmap
- Current integration inventory must be established from code/configuration, not from this roadmap.
- Stripe is a future consideration for both X-FIT SaaS subscriptions and payments made by gym customers. These are distinct business flows; do not conflate them or implement either unless requested and approved.
- Firebase/NoSQL is a future possibility, not a current requirement. Do not add a second database without an approved use case, ownership model, synchronization strategy, and tenant-isolation plan.
- Do not add queues, caches, storage providers, observability products, or other dependencies without a concrete requirement.

## 10. API contracts and documentation
- Follow the existing route/version/prefix conventions after inspecting the runtime.
- Update DTO validation, OpenAPI/Swagger decorators, and API tests together when a change affects the public contract.
- Scalar and Nest Swagger dependencies exist, but verify the actual setup and URL before documenting it as working.
- Avoid breaking existing API behavior without explicit approval and a migration/compatibility plan.

## 11. Testing and validation commands
Use scripts that actually exist in the relevant `package.json`. Do not invent commands or claim that an unrun command passed.

Verified scripts:
- Root: `pnpm build:frontend`, `pnpm build:backend`.
- Frontend: `pnpm --filter frontend lint`, `pnpm --filter frontend build`.
- Backend: `pnpm --filter backend lint`, `pnpm --filter backend test`, `pnpm --filter backend test:e2e`, `pnpm --filter backend build`.
- Backend test coverage script exists as `pnpm --filter backend test:cov`; use it only when coverage is relevant.
- No explicit frontend test script or standalone typecheck script was present in the inspected package manifests.

Run focused checks first, then broader checks appropriate to the change. Before using a command that could modify data, generate files, install packages, or alter configuration, inspect its effects and request approval if it falls under the sensitive-operation rules.

For every validation report, distinguish:
- Executed and passed.
- Executed and failed.
- Not run, with reason.
Never state that CI passed unless CI actually ran.

## 12. Safe and sensitive operations
Read-only inspection such as `git status`, `git diff`, `git log`, reading source/configuration, and searching files is normally safe.

Request explicit approval before:
- `git add`, commit, push, merge, pull/rebase that changes the worktree/history, branch deletion, force operations, tag publication, or pull-request creation.
- Prisma migrations, schema pushes, migration-state changes, resets, seeders, or bulk data changes.
- Destructive Docker operations, especially volume removal, database container/data deletion, or cleanup commands whose scope is unclear.
- Installing/updating dependencies, changing lockfiles, deploying, changing secrets, or performing irreversible external actions.
- Bulk deletion/renaming, tenant/platform initialization, or privileged administrative scripts.

Before requesting approval, state the exact command/action, what it changes, its target, and the principal risks. Approval is specific to the described operation and does not authorize chained or subsequent operations. Do not hide sensitive actions inside a script or combine them with unrelated work.

Do not commit or push as part of normal task completion. The human reviews `git status`, `git diff`, and `git diff --check` and decides when to publish changes.

## 13. Minimal-change policy
- Inspect before editing; use the existing implementation and conventions.
- Make the smallest complete change that satisfies the approved scope.
- Search for existing components, hooks, utilities, schemas, API clients, tests, and patterns before creating new ones.
- Do not regenerate, rewrite, or replace a working component merely to make a minor change. Prefer a focused edit that preserves its public API.
- Do not perform unrelated formatting, dependency upgrades, file moves, naming refactors, or speculative abstractions.
- Do not add a dependency if existing project tools can solve the requirement adequately.
- Preserve user changes and unrelated dirty work. Never discard changes just because they appear unrelated.

## 14. Current state versus target state
The repository is early-stage. Treat only code and configuration that exist and have been verified as current functionality. Intended future architecture includes the domain modules listed above, organization isolation, Better Auth integration, and complete test/CI practices. Do not create all planned modules in advance; implement only the approved task.

If implementation conflicts with these rules or a required domain decision is missing, explain the evidence, alternatives, impact, and the smallest decision needed. Stop only the blocked part; continue independent approved work where safe.

## 15. Agent workflow
### Architect
- Plan only; do not edit files or implement.
- Inspect runtime, tests, configuration, contracts, persistence, and relevant instructions.
- For a small isolated change, provide a compact plan. For a cross-module/security/persistence change, provide a full plan.
- Identify ownership, affected files, contracts, security, persistence/migration impact, tests, risks, open decisions, and stop conditions.
- Stop after delivering the plan.

### Builder
- Implement only a plan explicitly approved by the human, or a clearly scoped small task explicitly authorized for direct implementation.
- Inspect current repository state and diff before editing.
- Preserve approved scope and existing behavior; do not redesign or expand scope.
- Add/update relevant tests and API contracts.
- Do not perform sensitive operations without separate explicit approval.
- Never commit, push, merge, or create a pull request.

### Reviewer
- Review only; do not modify files.
- Compare the current diff and implementation against the approved plan.
- Prioritize correctness, security, organization isolation, data integrity, transactions, contracts, and required tests.
- Findings must include severity, evidence/location, impact, and required correction.
- Final decision: `Approved`, `Approved with Minor Changes`, `Changes Required`, or `Blocked`.

### Review convergence
After one or two reasonable correction rounds, continue blocking only on material defects (security, tenant isolation, data integrity, transaction correctness, contract correctness, required behavior, migration safety, or backward compatibility). Record optional refactors and style preferences as low-priority debt; do not expand scope.

## 16. Handoffs and completion
For multi-run work, record completed scope, files changed, commands actually run and results, remaining work, resume location/next action, risks, and blockers. On continuation, inspect the current repository and diff before relying on a handoff.

Use `Complete`, `Partial`, or `Blocked`.
`Complete` requires the approved scope, required tests/contracts/configuration, and required validation to be done, with no known required work remaining. If validation was skipped or required work remains, report `Partial` or `Blocked` and explain why.

## 17. Repository philosophy
Protect organization boundaries, preserve architectural clarity, and prefer verified correctness over unnecessary complexity.