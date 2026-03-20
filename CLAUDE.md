@AGENTS.md

# What We're Building

**PMAI** (Project Management AI) is an all-in-one platform for managing software projects end-to-end.
The core idea: define AI agents that autonomously break down work into Epics → Stories → Tasks,
then handle the full fulfillment loop — from planning to execution to delivery.

Key capabilities in scope:
- **Project management**: Jira-like backlog, sprints, issue tracking (Epic/Story/Task/Bug)
- **AI Agents**: define agents with roles, goals, and tools; they decompose and execute work
- **Workflow automation**: agents pick up tasks, run workflows, produce outputs
- **Integrations**: GitHub (code), Supabase (DB/deploy), CI/CD pipelines — everything linked to one project view
- **Single pane of glass**: one tool where the entire lifecycle of a software project lives

Think: Jira + Linear + AI agent orchestration + deployment integrations, purpose-built for AI-assisted software delivery.

# PMAI Project — Design System Guidelines

## Master Design System: Atlassian Design System

This project follows the **Atlassian Design System** as its single source of truth for all UI decisions.
Do NOT use shadcn/ui, Material UI, or other generic component libraries. All components are custom-built
using Atlassian's design tokens, patterns, and visual language.

## Reference Documentation

### Primary
- **Components & Tokens**: https://atlassian.design/components — use their component patterns, spacing tokens, color system
- **Lozenge / Status Badges**: https://atlassian.design/components/lozenge — status badge patterns (To Do, In Progress, Done)
- **Issue Types & Icons**: https://www.atlassian.com/software/jira/guides/issues/overview — Epic=purple, Story=green, Task=blue, Bug=red

### Source Code References
- **Atlaskit Components** (Lozenge, Avatar, Nav, Icons...): `atlassian/atlassian-frontend-mirror` on Bitbucket — source code of all Atlaskit components
- **Compiled** (CSS-in-JS): `atlassian-labs/compiled` on GitHub — Atlassian's CSS-in-JS library, reference for how they write styles
- **React Resource Router**: `atlassian-labs/react-resource-router` on GitHub — Atlassian's own router for React SPAs

### Design Tokens (extracted & verified)
Color tokens, typography, and spacing are defined in `src/components/JiraBacklogMockup.jsx` under the `T` constant.
These were extracted from https://atlassian.design/foundations/tokens/design-tokens/ and should be reused
across all new components. Key values:

- Brand: `#0C66E4` (bold), `#0055CC` (hover), `#E9F2FF` (subtle)
- Text: `#1D2125` (primary), `#44546F` (subtle), `#626F86` (subtlest)
- Surfaces: `#FFFFFF` (default), `#F7F8F9` (sunken), `#F1F2F4` (hovered)
- Sidebar: `#0C1929` (dark nav bg), `rgba(255,255,255,0.08)` (borders)
- Font stack: `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Ubuntu, system-ui, "Helvetica Neue", sans-serif`

## Frontend Engineering Standards

**Design system override (project-specific):** This project uses the **Atlassian Design System** exclusively.
Do NOT use shadcn/ui or any generic component library - even if the global CLAUDE.md suggests them as defaults.
Tailwind CSS is installed and used for utility classes, but design tokens (colors, spacing, typography) come
from Atlassian, not Tailwind defaults or shadcn/ui. All UI patterns follow Atlassian components (see Design System Guidelines above).

This is a **Next.js app**. Always apply `vercel-react-best-practices` rules when writing or modifying
React/Next.js code. Prioritize CRITICAL rules (async components, bundle optimization) over lower priority ones.
Reference `~/.claude/skills/vercel-react-best-practices/rules/` for detailed patterns.

Key principles:
- Prefer Server Components by default; only add `"use client"` when state/interactivity is needed
- Use Next.js App Router conventions (layouts, loading, error boundaries)
- Optimize bundle size: dynamic imports for heavy components, avoid barrel files
- Use `next/image` for images, `next/font` for fonts, `next/link` for navigation
- Minimize client-side JavaScript; push logic to the server where possible
- Always verify with `tsc --noEmit` + build after changes


# Project

Full-stack app with Next.js frontend, Python backend, and Supabase for database, storage and authentication.

## Tech Stack
- Next.js (App Router) + TypeScript strict mode
- Supabase - PostgreSQL, Storage, Authentication
- Python backend
- React Testing Library + Playwright for frontend tests
- pytest for Python backend tests

## Key Directories
- `/app` - Next.js app router pages and API routes
- `/components` - React components
- `/lib` - Utilities, helpers, type definitions
- `/backend` - Python backend

## Commands
- `npm run dev` - Dev server
- `npm run build` - Production build
- `npm run lint` - ESLint check
- `npm run typecheck` - TypeScript type check (`tsc --noEmit`)
- `npx playwright test` - Run E2E tests (Playwright installed, config at `playwright.config.ts`)
- `pytest` - Run Python backend tests

> Note: RTL/vitest integration test infrastructure not yet set up. When adding frontend tests,
> set up vitest + React Testing Library first.

## Architecture Rules
- Simple/straightforward DB operations go in Supabase database functions
- Complex business logic goes in the Python backend
- Never use `any` types in TypeScript
- Server Components by default - only add "use client" when needed
- Use Supabase Auth helpers - never roll custom auth

## Testing Approach

Follow the **Testing Trophy** (not the old pyramid):
- **Static** (TypeScript + ESLint): always on, highest ROI
- **Integration** (React Testing Library): main investment for frontend - test what users see and do, not implementation details. If you refactor without changing behavior, tests should not break. Minimize mocks; heavy mocking kills confidence.
- **Unit**: selective - pure logic only: utility functions, data transformations, hooks with complex state. Do NOT write unit tests for React components.
- **E2E** (Playwright): critical paths only - auth and core user journeys. Not every feature.

Layer-by-layer rules:
- **Before writing tests**: decide HOW this will be tested and confirm it's feasible - flag early if the design makes it untestable
- **Python backend**: strict TDD - write failing test first, then implement (red → green → refactor)
- **Next.js utils and custom hooks**: TDD
- **React components**: integration tests with React Testing Library - test behavior from the user's perspective, not internals
- **Critical user flows** (auth, key journeys): Playwright E2E tests
- **Supabase DB functions**: manual verification against dev DB
- Never mark a feature done without running the relevant tests
- **Parallel agents for tests**: when running multiple independent suites (e.g. unit + integration + E2E), spawn them as parallel agents - each suite runs in its own context, no shared state, faster total time

## Supabase MCP
- The Supabase MCP server for this project is named **`PMAI_supabase`**
- Always use this MCP server (not any other Supabase MCP) for all DB operations, migrations, queries, and Supabase management tasks on this project
- Tool prefix: `mcp__PMAI_supabase__<tool>` (e.g., `mcp__PMAI_supabase__execute_sql`, `mcp__PMAI_supabase__apply_migration`)

## Workflow
- For research tasks, spawn parallel subagents instead of doing sequentially
- When investigating a bug, use a subagent to explore the codebase while keeping main context clean
- For large refactors, use a subagent to map all usages before touching anything
- For changes under 20 lines just do it - for larger changes show a plan first
- After any code change, run lint + typecheck before saying you're done
- Use /clear between unrelated tasks
- Keep `TASKS.md` at the project root up to date (see global CLAUDE.md for format and trigger rules)