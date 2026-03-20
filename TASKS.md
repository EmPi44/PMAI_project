# TASKS.md
_Session: Workflow canvas bug audit + fixes | Updated: 2026-03-20_

## What We're Doing
Ran a Playwright E2E audit of the workflow canvas (69 tests across 10 suites) and identified
real bugs vs test code issues. Now fixing the confirmed bugs and cleaning up the test suite.
Dev server runs on **port 3001** (not 3000 - there's a port conflict).

## Done This Session
- [x] Created `playwright.config.ts` (targets localhost:3001)
- [x] Created `tests/e2e/workflow-canvas.spec.ts` - 69 tests, 49 pass / 20 fail
- [x] Identified 3 real app bugs and 14 test code bugs
- [x] Documented everything in bug report

## Remaining Tasks

### Task 1: Fix `+ Add` dropdown doesn't close on canvas click
**Priority**: medium
**File**: `src/components/workflows/WorkflowToolbar.tsx` lines ~151-160
**What to do**: The dropdown uses `document.addEventListener("mousedown", handleClick)` to
detect outside clicks, but ReactFlow intercepts mousedown on the canvas pane, stopping
propagation. Replace with a transparent backdrop `<div>` (`position: fixed; inset: 0; zIndex: 49`)
that renders when `addMenuOpen` is true and calls `setAddMenuOpen(false)` on click. The dropdown
itself should be at `zIndex: 50` so it sits above the backdrop.
**Why**: Clicking on the ReactFlow canvas while the dropdown is open leaves it stuck open.
**Verify**: `npx playwright test tests/e2e/workflow-canvas.spec.ts --grep "3.2"` should pass

### Task 2: Fix silent data loss on navigation before auto-save fires
**Priority**: high (user's main complaint - "basic things adding to new canvas")
**File**: `src/components/workflows/WorkflowCanvas.tsx` + `src/components/workflows/WorkflowToolbar.tsx`
**What to do**: Two changes:
1. Reduce debounce from 1500ms to 500ms in WorkflowCanvas.tsx (~line 100)
2. Replace `<Link href="/workflows">` in WorkflowToolbar.tsx (~line 177) with a button that
   calls `saveCanvas()` immediately then `router.push("/workflows")`. Import `useRouter` from
   `next/navigation` in WorkflowToolbar, or lift the flush-save callback from WorkflowCanvas as a prop.
**Why**: If user adds a node and clicks back within 1.5s, changes are lost silently.
**Verify**: Add a node, immediately click `← Workflows`, navigate back - node should still be there.
Also run `npx playwright test tests/e2e/workflow-canvas.spec.ts` - suite 9 should go green.

### Task 3: Fix Playwright test suite (14 test code bugs)
**Priority**: medium (needed to make tests reliable)
**File**: `tests/e2e/workflow-canvas.spec.ts`
**What to do**:
1. **`beforeAll` save timing** (suites 4, 7, 8, 10): Add `await waitForSave(page)` before
   `await page.close()` in each `beforeAll`. The `waitForSave` helper is defined at line ~32.
2. **Strict mode on `getByText("End")`** (tests 3.4 and 9.5): Add `.first()`:
   `await expect(page.getByText("End").first()).toBeVisible()`
3. **Wrong keyboard shortcut** (test 6.4): Change `Control+z` to `Meta+z` (macOS uses Cmd+Z)
4. **`getByText("WORKFLOW")` partial match** (test 1.2): Add `{ exact: true }` to all 4 header checks:
   `page.getByText("WORKFLOW", { exact: true })`
**Verify**: `npx playwright test tests/e2e/workflow-canvas.spec.ts --reporter=list` - expect 65+ passing

### Task 4: Investigate node click unreliable (test 9.4)
**Priority**: low (investigate only, fix if real app bug)
**File**: `tests/e2e/workflow-canvas.spec.ts:589`
**What to do**: Run test 9.4 in isolation: `npx playwright test --grep "9.4"`. If it consistently
fails, check if `getByText("New Activity")` is matching multiple elements when the edit panel is
already open (auto-selected on node add). Also check if the node is being placed off-screen or
under another element. Compare DOM snapshot before the failing click to understand why.
**Why**: Test 5.1 uses identical code and passes. Test 9.4 times out on the same click. Root cause unclear.
**Verify**: `npx playwright test --grep "9.4"` passes

## Key Decisions Made
- Using `playwright` package (v1.58.2) which includes the test runner - import from `playwright/test`
- Canvas node selection is triggered both by clicking a node AND automatically on `addNode()` call
- Auto-save is a 1500ms debounce tied to `nodes`/`edges` state changes in WorkflowCanvas.tsx

## Watch Out For
- Dev server is on port 3001 (not 3000) - another Next.js instance is on 3000
- `beforeAll` hooks need `{ browser }` fixture (not `{ page }`) to manage lifecycle manually
- ReactFlow canvas takes over pointer events - don't rely on `document` event listeners for
  click-outside detection when the canvas is involved
- `getByText()` in Playwright is a partial match by default - use `{ exact: true }` for column
  headers or short strings that might appear inside longer strings
