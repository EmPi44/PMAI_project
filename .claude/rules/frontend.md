---
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
  - "src/**/*.css"
  - "next.config.*"
---

# Frontend Rules - PMAI

## Skills Auto-Activation

When editing frontend files, automatically activate these skills:

1. **`react-frontend-agent`** - apply Vercel React best practices inline as you write code. Load rules from `~/.claude/skills/vercel-react-best-practices/rules/`. Prioritize CRITICAL rules (async-*, bundle-*).
2. **`frontend-design`** - invoke for ALL frontend work to ensure production-grade design quality. This is the DEFAULT.
3. **`ui-ux-pro-max`** - use for deeper design decisions: layout, color, typography, polish.
4. **`vercel-react-best-practices`** - apply performance rules when touching React/Next.js code.

**IMPORTANT: This project uses the Atlassian Design System exclusively. Do NOT use shadcn/ui, Material UI, or Tailwind defaults. All components are custom-built using Atlassian design tokens and patterns.**

Apply rules inline as you go - don't do a separate review pass. If a rule conflicts with the user's explicit request or the Atlassian Design System, the user/Atlassian wins.

## Transparency Report (frontend-specific)

When frontend skills are used, add to the transparency report:
```
Rules applied: [rule-id]: [one-line reason] (priority: CRITICAL/HIGH/MEDIUM/LOW)
Frontend plugin used: frontend-design (default) | skipped (reason)
Design system: Atlassian Design System
```
