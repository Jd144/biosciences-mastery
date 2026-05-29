# Restart Workflow (Same Features, Fresh Start)

This folder implements a restart-ready workflow while preserving current product scope.

## 1) Backup / Snapshot

From repository root:

```bash
npm run restart:snapshot
```

This creates `restart/backups/<timestamp>/` with:
- source snapshot (`src`, `public`, `supabase`, key config files)
- `snapshot-manifest.json` including env key inventory and route inventory

## 2) Keep Scope Equivalent

Use `restart/feature-parity-baseline.json` as the source of truth for must-keep features, auth/roles, and data-model references.

## 3) Start a Fresh Scaffold

Create a clean app in an isolated folder using the ecosystem scaffolder:

```bash
npx create-next-app@latest fresh-biosciences --ts --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

Then re-implement features in phases using the parity baseline.

## 4) Re-implementation Priority

Recommended implementation order:
1. Auth + role checks
2. Subjects/topics/content read flows
3. Payments + entitlements
4. Quizzes/PYQs/mock tests
5. AI features
6. Admin tools and analytics

## 5) Data Migration

Use `restart/migration-strategy.json` for phased migration checkpoints.

## 6) Phase-by-Phase Comparison

After each phase, compare old/new behavior using route and API parity from snapshot manifest.

## 7) Final Parity Validation

Use `restart/parity-checklist.json` to validate functionality, performance, security, and deployment readiness.

## 8) Archive Old Project

Once parity is confirmed:
- freeze old deployment as read-only fallback
- keep backup snapshots for rollback
- promote new project as primary
