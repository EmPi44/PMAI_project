@AGENTS.md

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
