---
paths:
  - "backend/**/*.py"
  - "backend/**/*.sql"
  - "supabase/**/*.sql"
  - "supabase/**/*.ts"
  - "src/lib/supabase/**/*.ts"
  - "src/domains/**/*.ts"
  - "src/app/api/**/*.ts"
---

# Supabase Naming Conventions

## Table Naming — Domain Prefix Rule

Tables that belong to a domain (i.e., they extend or relate to a root entity) MUST be prefixed
with that root entity's singular name.

### Why
As the project grows, tables may be moved into separate Postgres schemas (e.g., `teams`, `billing`,
`ai`). Prefixing now prevents naming clashes across schemas and makes the table's domain ownership
immediately clear when scanning the DB.

### Pattern
```
{domain_singular}_{concept}
```

### Examples
Root table: `teams`

| ✅ Correct              | ❌ Wrong          | Reason                                  |
|------------------------|------------------|-----------------------------------------|
| `team_ai_agents`       | `ai_agents`      | Scoped to teams domain                  |
| `team_members`         | `members`        | Too generic — members of what?          |
| `team_invites`         | `invites`        | Invites could belong to many domains    |
| `team_settings`        | `settings`       | Settings of what entity?                |

Root table: `projects`

| ✅ Correct              | ❌ Wrong          |
|------------------------|------------------|
| `project_sprints`      | `sprints`        |
| `project_issues`       | `issues`         |
| `project_integrations` | `integrations`   |
| `project_members`      | `members`        |

Root table: `workflows`

| ✅ Correct              | ❌ Wrong          |
|------------------------|------------------|
| `workflow_steps`       | `steps`          |
| `workflow_triggers`    | `triggers`       |
| `workflow_runs`        | `runs`           |

## Root Tables (no prefix needed)

Top-level entities that own a domain stand alone:
- `teams`
- `projects`
- `workflows`
- `users` (managed by Supabase Auth — `auth.users`)
- `organizations` (if added later)

## Additional Rules

- All table names: **snake_case**, **plural**
- All column names: **snake_case**
- Foreign keys: `{referenced_table_singular}_id` (e.g., `team_id`, `project_id`)
- Timestamps: always `created_at`, `updated_at` (not `createdAt`, `created_date`, etc.)
- Soft deletes: `deleted_at TIMESTAMPTZ` (nullable — null means not deleted)
- Primary keys: `id UUID DEFAULT gen_random_uuid()`
