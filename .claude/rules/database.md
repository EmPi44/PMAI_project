---
paths:
  - "migrations/**"
  - "supabase/**"
  - "**/*.sql"
  - "src/lib/db/**"
  - "backend/**/*db*"
  - "backend/**/*supabase*"
---

# Database Conventions (Supabase / PostgreSQL)

## Standard columns — every table must have these three

```sql
id          uuid        PRIMARY KEY DEFAULT gen_random_uuid()
created_at  timestamptz NOT NULL DEFAULT now()
updated_at  timestamptz NOT NULL DEFAULT now()
```

`updated_at` must be kept current automatically via a shared trigger — never rely on the application layer to set it:

```sql
-- Create once, reuse across all tables
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to every table (repeat per table)
CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON <table_name>
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

## Soft deletes — never hard-delete important records

Any table that holds business-critical data (leads, clients, projects, users, issues, agents, workflows, etc.) must use soft deletion:

```sql
deleted_at  timestamptz  -- NULL = active, non-NULL = deleted at that timestamp
```

- **Filter in queries**: always add `WHERE deleted_at IS NULL` (or use a view/RLS policy)
- **Never use a boolean `is_deleted`** — the timestamp is the source of truth; it tells you *when* it happened
- Hard deletes are only acceptable for truly transient/log data (e.g. ephemeral job queue rows)

## Fixed columns vs. JSONB — think before you add a column

Before adding a new column, ask: **"Is this value queried, filtered, or indexed?"**

| Use **fixed typed columns** when… | Use **JSONB** when… |
|---|---|
| You filter/sort/join on it | It's metadata you read but never filter on |
| It needs a FK constraint or index | The shape varies per row or is user-defined |
| It's required / has a default | It's optional, sparse, or evolves frequently |
| Type safety matters (dates, enums) | You're storing arbitrary key-value config |

Practical rules:
- Core domain fields (status, owner_id, title, priority) → **fixed columns**
- Flexible settings, custom fields, integration payloads → **`metadata jsonb`**
- Never put something in JSONB just to avoid a migration — if it's queried, give it a real column
- Use `jsonb` (not `json`) — it's indexed and supports operators

## Naming conventions

- Table names: **snake_case, plural** (e.g. `project_members`, `workflow_runs`)
- Column names: **snake_case** (e.g. `created_by`, `external_id`)
- FK columns: `<referenced_table_singular>_id` (e.g. `project_id`, `user_id`)
- Boolean columns: `is_<adjective>` or `has_<noun>` (e.g. `is_active`, `has_attachments`)
- Timestamp columns: `<event>_at` (e.g. `started_at`, `completed_at`, `deleted_at`)
