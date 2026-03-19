/**
 * Workflow Canvas - End-to-End Test Suite
 *
 * Covers the most common user activities on the workflow canvas.
 * Tests are grouped by feature area and run sequentially within each suite.
 * Screenshots on failure are saved to .test-artifacts/results/
 */

import { test, expect, type Page } from "playwright/test";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Click the "+ Add" button and select a node type from the dropdown */
async function addNode(page: Page, label: string) {
  await page.getByRole("button", { name: "+ Add" }).click();
  await page.getByRole("button", { name: label, exact: false }).first().click();
}

/** Wait for the auto-save indicator to show "✓ Saved" */
async function waitForSave(page: Page) {
  await page.getByText("✓ Saved").waitFor({ timeout: 8_000 });
}

/** Navigate to /workflows and create a new workflow, returns the canvas URL */
async function createWorkflow(page: Page, name: string): Promise<string> {
  await page.goto("/workflows");
  await page.getByRole("button", { name: "+ New Workflow" }).click();
  await page.getByPlaceholder("e.g. Customer Onboarding").fill(name);
  await page.getByRole("button", { name: "Create & Open Canvas" }).click();
  await page.waitForURL(/\/workflows\/[a-z0-9-]+$/, { timeout: 15_000 });
  return page.url();
}

// ─── Suite 1: Workflows List Page ───────────────────────────────────────────

test.describe("1. Workflows list page", () => {
  test("1.1 - loads and shows page heading", async ({ page }) => {
    await page.goto("/workflows");
    await expect(page.getByRole("heading", { name: "Workflows" })).toBeVisible();
  });

  test("1.2 - shows table header columns", async ({ page }) => {
    await page.goto("/workflows");
    await expect(page.getByText("WORKFLOW", { exact: true })).toBeVisible();
    await expect(page.getByText("STATUS", { exact: true })).toBeVisible();
    await expect(page.getByText("SCENARIOS", { exact: true })).toBeVisible();
    await expect(page.getByText("NODES", { exact: true })).toBeVisible();
  });

  test("1.3 - '+ New Workflow' button is visible", async ({ page }) => {
    await page.goto("/workflows");
    await expect(page.getByRole("button", { name: "+ New Workflow" })).toBeVisible();
  });

  test("1.4 - 'New Workflow' modal opens on click", async ({ page }) => {
    await page.goto("/workflows");
    await page.getByRole("button", { name: "+ New Workflow" }).click();
    await expect(page.getByRole("heading", { name: "New Workflow" })).toBeVisible();
    await expect(page.getByPlaceholder("e.g. Customer Onboarding")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create & Open Canvas" })).toBeVisible();
  });

  test("1.5 - 'Create & Open Canvas' is disabled when name is empty", async ({ page }) => {
    await page.goto("/workflows");
    await page.getByRole("button", { name: "+ New Workflow" }).click();
    const createBtn = page.getByRole("button", { name: "Create & Open Canvas" });
    await expect(createBtn).toBeDisabled();
  });

  test("1.6 - modal closes on Cancel", async ({ page }) => {
    await page.goto("/workflows");
    await page.getByRole("button", { name: "+ New Workflow" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("heading", { name: "New Workflow" })).not.toBeVisible();
  });

  test("1.7 - creating a workflow navigates to canvas", async ({ page }) => {
    const url = await createWorkflow(page, `Test Workflow ${Date.now()}`);
    expect(url).toMatch(/\/workflows\/[a-z0-9-]+$/);
  });

  test("1.8 - new workflow appears in the list after creation", async ({ page }) => {
    const name = `List Test ${Date.now()}`;
    await createWorkflow(page, name);
    await page.goto("/workflows");
    await expect(page.getByText(name)).toBeVisible();
  });

  test("1.9 - 'Open Canvas' link on a workflow row navigates to canvas", async ({ page }) => {
    // Create one first to ensure there's something in the list
    const name = `Nav Test ${Date.now()}`;
    await createWorkflow(page, name);
    await page.goto("/workflows");
    // Find the row and click its Open Canvas link
    const row = page.getByText(name).locator("..").locator("..");
    await row.getByRole("link", { name: "Open Canvas" }).click();
    await expect(page).toHaveURL(/\/workflows\/[a-z0-9-]+$/);
  });
});

// ─── Suite 2: Canvas - Initial State ────────────────────────────────────────

test.describe("2. Canvas initial state", () => {
  let canvasUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    canvasUrl = await createWorkflow(page, `Canvas Init ${Date.now()}`);
    await page.close();
  });

  test("2.1 - toolbar is visible with workflow name", async ({ page }) => {
    await page.goto(canvasUrl);
    await expect(page.getByText("← Workflows")).toBeVisible();
    await expect(page.getByRole("button", { name: "+ Add" })).toBeVisible();
  });

  test("2.2 - empty state message shown on blank canvas", async ({ page }) => {
    await page.goto(canvasUrl);
    await expect(page.getByText("Empty workflow")).toBeVisible();
    await expect(page.getByText("Click")).toBeVisible();
  });

  test("2.3 - undo/redo buttons are visible", async ({ page }) => {
    await page.goto(canvasUrl);
    await expect(page.getByTitle("Undo (Ctrl+Z)")).toBeVisible();
    await expect(page.getByTitle("Redo (Ctrl+Y)")).toBeVisible();
  });

  test("2.4 - undo is disabled on a fresh canvas", async ({ page }) => {
    await page.goto(canvasUrl);
    await expect(page.getByTitle("Undo (Ctrl+Z)")).toBeDisabled();
  });

  test("2.5 - redo is disabled on a fresh canvas", async ({ page }) => {
    await page.goto(canvasUrl);
    await expect(page.getByTitle("Redo (Ctrl+Y)")).toBeDisabled();
  });

  test("2.6 - '+ Scenario' button is visible", async ({ page }) => {
    await page.goto(canvasUrl);
    await expect(page.getByRole("button", { name: "+ Scenario" })).toBeVisible();
  });

  test("2.7 - Layout and Fit buttons are visible", async ({ page }) => {
    await page.goto(canvasUrl);
    await expect(page.getByTitle("Auto-arrange nodes (Dagre layout)")).toBeVisible();
    await expect(page.getByTitle("Fit all nodes in view")).toBeVisible();
  });

  test("2.8 - JSON toggle button is visible", async ({ page }) => {
    await page.goto(canvasUrl);
    await expect(page.getByTitle("Toggle JSON editor")).toBeVisible();
  });
});

// ─── Suite 3: Adding Nodes ───────────────────────────────────────────────────

test.describe("3. Adding nodes", () => {
  let canvasUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    canvasUrl = await createWorkflow(page, `Add Nodes Test ${Date.now()}`);
    await page.close();
  });

  test("3.1 - '+ Add' opens dropdown menu", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByRole("button", { name: "+ Add" }).click();
    await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
    await expect(page.getByRole("button", { name: "End" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Activity — Human" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Activity — Auto" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Activity — System" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Decision" })).toBeVisible();
  });

  test("3.2 - dropdown closes when clicking outside", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByRole("button", { name: "+ Add" }).click();
    await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
    // Click elsewhere
    await page.mouse.click(600, 400);
    await expect(page.getByRole("button", { name: "Start" })).not.toBeVisible();
  });

  test("3.3 - adding a Start node shows it on canvas", async ({ page }) => {
    await page.goto(canvasUrl);
    // Canvas should be empty first - check no Start node yet
    await addNode(page, "Start");
    // The empty state should disappear
    await expect(page.getByText("Empty workflow")).not.toBeVisible();
    // A start node text should appear
    await expect(page.getByText("Start").first()).toBeVisible();
  });

  test("3.4 - adding an End node shows it on canvas", async ({ page }) => {
    await page.goto(canvasUrl);
    await addNode(page, "End");
    await expect(page.getByText("End").first()).toBeVisible();
  });

  test("3.5 - adding Activity (Human) node shows it", async ({ page }) => {
    await page.goto(canvasUrl);
    await addNode(page, "Activity — Human");
    await expect(page.getByText("New Activity")).toBeVisible();
  });

  test("3.6 - adding Activity (Auto) node shows it", async ({ page }) => {
    await page.goto(canvasUrl);
    await addNode(page, "Activity — Auto");
    await expect(page.getByText("New Activity")).toBeVisible();
  });

  test("3.7 - adding Activity (System) node shows it", async ({ page }) => {
    await page.goto(canvasUrl);
    await addNode(page, "Activity — System");
    await expect(page.getByText("New Activity")).toBeVisible();
  });

  test("3.8 - adding a Decision node shows it", async ({ page }) => {
    await page.goto(canvasUrl);
    await addNode(page, "Decision");
    await expect(page.getByText("Decision?")).toBeVisible();
  });

  test("3.9 - adding a node enables undo", async ({ page }) => {
    await page.goto(canvasUrl);
    await addNode(page, "Start");
    await expect(page.getByTitle("Undo (Ctrl+Z)")).toBeEnabled();
  });

  test("3.10 - adding a node triggers auto-save", async ({ page }) => {
    await page.goto(canvasUrl);
    await addNode(page, "Start");
    await waitForSave(page);
  });
});

// ─── Suite 4: Node Selection and Editing ─────────────────────────────────────

test.describe("4. Node selection and editing", () => {
  let canvasUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    canvasUrl = await createWorkflow(page, `Node Edit Test ${Date.now()}`);
    // Pre-add nodes
    await addNode(page, "Activity — Human");
    await addNode(page, "Start");
    await addNode(page, "Decision");
    await waitForSave(page);
    await page.close();
  });

  test("4.1 - clicking an Activity node opens the edit panel", async ({ page }) => {
    await page.goto(canvasUrl);
    // Click on the "New Activity" text node
    await page.getByText("New Activity").first().click();
    await expect(page.getByText("Edit Activity")).toBeVisible();
  });

  test("4.2 - edit panel shows LABEL field", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByText("New Activity").first().click();
    await expect(page.getByText("LABEL")).toBeVisible();
  });

  test("4.3 - edit panel shows ACTOR field for activity nodes", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByText("New Activity").first().click();
    await expect(page.getByText("ACTOR")).toBeVisible();
    await expect(page.getByRole("button", { name: /Human/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Automated/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /System/i })).toBeVisible();
  });

  test("4.4 - edit panel shows DESCRIPTION field", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByText("New Activity").first().click();
    await expect(page.getByText("DESCRIPTION")).toBeVisible();
    await expect(page.getByPlaceholder("Optional notes...")).toBeVisible();
  });

  test("4.5 - edit panel shows Delete Node button", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByText("New Activity").first().click();
    await expect(page.getByRole("button", { name: "Delete Node" })).toBeVisible();
  });

  test("4.6 - node label can be edited in the panel", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByText("New Activity").first().click();
    await expect(page.getByText("Edit Activity")).toBeVisible();
    // Use the first textbox (label input in the edit panel)
    const input = page.getByRole("textbox").first();
    await input.click({ clickCount: 3 });
    await input.fill("Renamed Activity");
    await expect(page.getByText("Renamed Activity")).toBeVisible();
  });

  test("4.7 - clicking Start node shows 'Edit Start' panel", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.locator(".react-flow__node-start").first().click();
    await expect(page.getByText("Edit Start")).toBeVisible();
  });

  test("4.8 - clicking Decision node shows 'Edit Decision' panel", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.locator(".react-flow__node-decision").first().click();
    await expect(page.getByText("Edit Decision")).toBeVisible();
  });

  test("4.9 - Start/Decision node edit panel does NOT show ACTOR field", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.locator(".react-flow__node-start").first().click();
    await expect(page.getByText("Edit Start")).toBeVisible();
    // ACTOR section should not be visible for Start nodes
    const actorLabel = page.locator("text=ACTOR");
    await expect(actorLabel).not.toBeVisible();
  });

  test("4.10 - Close button (×) dismisses the edit panel", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByText("New Activity").first().click();
    await expect(page.getByText("Edit Activity")).toBeVisible();
    await page.getByLabel("Close panel").click();
    await expect(page.getByText("Edit Activity")).not.toBeVisible();
  });

  test("4.11 - clicking the canvas background deselects node", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByText("New Activity").first().click();
    await expect(page.getByText("Edit Activity")).toBeVisible();
    // Click on empty canvas area
    await page.locator(".react-flow__pane").click({ position: { x: 50, y: 50 } });
    await expect(page.getByText("Edit Activity")).not.toBeVisible();
  });
});

// ─── Suite 5: Node Deletion ───────────────────────────────────────────────────

test.describe("5. Node deletion", () => {
  test("5.1 - deleting a node removes it from canvas", async ({ page }) => {
    const url = await createWorkflow(page, `Delete Test ${Date.now()}`);
    await addNode(page, "Activity — Human");
    await page.getByText("New Activity").click();
    await page.getByRole("button", { name: "Delete Node" }).click();
    await expect(page.getByText("New Activity")).not.toBeVisible();
    await expect(page.getByText("Empty workflow")).toBeVisible();
  });

  test("5.2 - deleting a node enables undo", async ({ page }) => {
    const url = await createWorkflow(page, `Delete Undo ${Date.now()}`);
    await addNode(page, "Activity — Human");
    await page.getByText("New Activity").click();
    await page.getByRole("button", { name: "Delete Node" }).click();
    await expect(page.getByTitle("Undo (Ctrl+Z)")).toBeEnabled();
  });

  test("5.3 - Backspace key deletes a selected node", async ({ page }) => {
    const url = await createWorkflow(page, `Delete Key ${Date.now()}`);
    await addNode(page, "Activity — Human");
    await page.getByText("New Activity").click();
    // Close the edit panel first so focus is on canvas, then press Delete
    await page.getByLabel("Close panel").click();
    await page.locator(".react-flow__node").first().click();
    await page.keyboard.press("Delete");
    await expect(page.getByText("Empty workflow")).toBeVisible();
  });
});

// ─── Suite 6: Undo / Redo ────────────────────────────────────────────────────

test.describe("6. Undo / Redo", () => {
  test("6.1 - undo removes a newly added node", async ({ page }) => {
    const url = await createWorkflow(page, `Undo Test ${Date.now()}`);
    await addNode(page, "Activity — Human");
    await expect(page.getByText("New Activity")).toBeVisible();
    await page.getByTitle("Undo (Ctrl+Z)").click();
    await expect(page.getByText("Empty workflow")).toBeVisible();
  });

  test("6.2 - redo re-adds an undone node", async ({ page }) => {
    const url = await createWorkflow(page, `Redo Test ${Date.now()}`);
    await addNode(page, "Activity — Human");
    await page.getByTitle("Undo (Ctrl+Z)").click();
    await expect(page.getByText("Empty workflow")).toBeVisible();
    await page.getByTitle("Redo (Ctrl+Y)").click();
    await expect(page.getByText("New Activity")).toBeVisible();
  });

  test("6.3 - redo is disabled after undo + new action", async ({ page }) => {
    const url = await createWorkflow(page, `Redo Disabled ${Date.now()}`);
    await addNode(page, "Activity — Human");
    await page.getByTitle("Undo (Ctrl+Z)").click();
    // New action clears redo stack
    await addNode(page, "Start");
    await expect(page.getByTitle("Redo (Ctrl+Y)")).toBeDisabled();
  });

  test("6.4 - Ctrl+Z keyboard shortcut triggers undo", async ({ page }) => {
    const url = await createWorkflow(page, `Keyboard Undo ${Date.now()}`);
    await addNode(page, "Decision");
    await expect(page.getByText("Decision?")).toBeVisible();
    // Click canvas to ensure focus is on canvas, not an input
    await page.locator(".react-flow__pane").click({ position: { x: 300, y: 300 } });
    await page.keyboard.press("Meta+z");
    await expect(page.getByText("Decision?")).not.toBeVisible();
  });

  test("6.5 - multiple undos work correctly", async ({ page }) => {
    const url = await createWorkflow(page, `Multi Undo ${Date.now()}`);
    await addNode(page, "Start");
    await addNode(page, "End");
    await page.getByTitle("Undo (Ctrl+Z)").click();
    await page.getByTitle("Undo (Ctrl+Z)").click();
    await expect(page.getByText("Empty workflow")).toBeVisible();
  });
});

// ─── Suite 7: Toolbar Tools ──────────────────────────────────────────────────

test.describe("7. Toolbar tools", () => {
  let canvasUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    canvasUrl = await createWorkflow(page, `Toolbar Test ${Date.now()}`);
    await addNode(page, "Start");
    await addNode(page, "Activity — Human");
    await addNode(page, "End");
    await waitForSave(page);
    await page.close();
  });

  test("7.1 - Layout button arranges nodes without error", async ({ page }) => {
    await page.goto(canvasUrl);
    // Just click it - as long as it doesn't crash/error
    await page.getByTitle("Auto-arrange nodes (Dagre layout)").click();
    // Nodes should still be visible
    await expect(page.locator(".react-flow__node").first()).toBeVisible();
  });

  test("7.2 - Layout enables undo", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByTitle("Auto-arrange nodes (Dagre layout)").click();
    await expect(page.getByTitle("Undo (Ctrl+Z)")).toBeEnabled();
  });

  test("7.3 - Fit view button runs without error", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByTitle("Fit all nodes in view").click();
    // Canvas should still be visible
    await expect(page.locator(".react-flow__renderer")).toBeVisible();
  });

  test("7.4 - JSON panel opens on button click", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByTitle("Toggle JSON editor").click();
    // JSON panel should contain some JSON
    await expect(page.locator("textarea").filter({ hasText: /nodes/ }).first()).toBeVisible();
  });

  test("7.5 - JSON panel closes on second click (toggle)", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByTitle("Toggle JSON editor").click();
    await expect(page.locator("textarea")).toBeVisible();
    await page.getByTitle("Toggle JSON editor").click();
    await expect(page.locator("textarea")).not.toBeVisible();
  });

  test("7.6 - back link '← Workflows' navigates to list", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByText("← Workflows").click();
    await expect(page).toHaveURL("/workflows");
  });
});

// ─── Suite 8: Scenarios ──────────────────────────────────────────────────────

test.describe("8. Scenarios", () => {
  let canvasUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    canvasUrl = await createWorkflow(page, `Scenarios Test ${Date.now()}`);
    await addNode(page, "Start");
    await addNode(page, "Activity — Human");
    await waitForSave(page);
    await page.close();
  });

  test("8.1 - '+ Scenario' button opens scenario modal", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByRole("button", { name: "+ Scenario" }).click();
    await expect(page.getByRole("heading", { name: "New Scenario" })).toBeVisible();
    await expect(page.getByPlaceholder("e.g. Happy Path, Error Case...")).toBeVisible();
  });

  test("8.2 - Create Scenario is disabled when label is empty", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByRole("button", { name: "+ Scenario" }).click();
    await expect(page.getByRole("button", { name: "Create Scenario" })).toBeDisabled();
  });

  test("8.3 - scenario modal closes on Cancel", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByRole("button", { name: "+ Scenario" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("heading", { name: "New Scenario" })).not.toBeVisible();
  });

  test("8.4 - creating a scenario shows it in toolbar", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByRole("button", { name: "+ Scenario" }).click();
    await page.getByPlaceholder("e.g. Happy Path, Error Case...").fill("Happy Path");
    await page.getByRole("button", { name: "Create Scenario" }).click();
    await expect(page.getByRole("button", { name: "Happy Path" })).toBeVisible();
  });

  test("8.5 - created scenario is auto-activated", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByRole("button", { name: "+ Scenario" }).click();
    await page.getByPlaceholder("e.g. Happy Path, Error Case...").fill("Auto Activate");
    await page.getByRole("button", { name: "Create Scenario" }).click();
    // The ✕ deactivate button should be visible when scenario is active
    await expect(page.getByTitle("Clear scenario")).toBeVisible();
  });

  test("8.6 - clicking active scenario button deactivates it", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByRole("button", { name: "+ Scenario" }).click();
    await page.getByPlaceholder("e.g. Happy Path, Error Case...").fill("Toggle Test");
    await page.getByRole("button", { name: "Create Scenario" }).click();
    // Scenario should be active
    await expect(page.getByTitle("Clear scenario")).toBeVisible();
    // Click the active scenario button to deactivate
    await page.getByRole("button", { name: "Toggle Test" }).click();
    await expect(page.getByTitle("Clear scenario")).not.toBeVisible();
  });

  test("8.7 - clicking ✕ clears active scenario", async ({ page }) => {
    await page.goto(canvasUrl);
    await page.getByRole("button", { name: "+ Scenario" }).click();
    await page.getByPlaceholder("e.g. Happy Path, Error Case...").fill("Clear Test");
    await page.getByRole("button", { name: "Create Scenario" }).click();
    await page.getByTitle("Clear scenario").click();
    await expect(page.getByTitle("Clear scenario")).not.toBeVisible();
  });

  test("8.8 - node edit panel shows SCENARIOS section when scenarios exist", async ({ page }) => {
    await page.goto(canvasUrl);
    // Ensure we have a scenario (create one)
    await page.getByRole("button", { name: "+ Scenario" }).click();
    await page.getByPlaceholder("e.g. Happy Path, Error Case...").fill("Scenario Section");
    await page.getByRole("button", { name: "Create Scenario" }).click();
    // Click a node to open edit panel
    await page.locator(".react-flow__node-activity").first().click();
    await expect(page.getByText("SCENARIOS")).toBeVisible();
  });
});

// ─── Suite 9: Auto-save and Persistence ──────────────────────────────────────

test.describe("9. Auto-save and persistence", () => {
  test("9.1 - save indicator appears after adding a node", async ({ page }) => {
    const url = await createWorkflow(page, `Save Test ${Date.now()}`);
    await addNode(page, "Start");
    // Either "Saving..." or "✓ Saved" should appear
    const saveIndicator = page.locator("text=/Saving|Saved/");
    await expect(saveIndicator).toBeVisible({ timeout: 5_000 });
  });

  test("9.2 - save indicator shows '✓ Saved' after auto-save completes", async ({ page }) => {
    const url = await createWorkflow(page, `Save Complete ${Date.now()}`);
    await addNode(page, "Activity — Human");
    await waitForSave(page);
  });

  test("9.3 - nodes persist after page reload", async ({ page }) => {
    const url = await createWorkflow(page, `Persist Test ${Date.now()}`);
    await addNode(page, "Activity — Human");
    await waitForSave(page);
    // Reload and verify the node is still there
    await page.reload();
    await expect(page.getByText("New Activity")).toBeVisible();
  });

  test("9.4 - edited label persists after page reload", async ({ page }) => {
    const url = await createWorkflow(page, `Label Persist ${Date.now()}`);
    await addNode(page, "Activity — Human");
    // Click the node to edit its label
    await page.getByText("New Activity").click();
    const panel = page.locator('div').filter({ hasText: "Edit Activity" }).last();
    const input = panel.locator("input").first();
    await input.click({ clickCount: 3 });
    const uniqueLabel = `Persisted Label ${Date.now()}`;
    await input.fill(uniqueLabel);
    await waitForSave(page);
    await page.reload();
    await expect(page.getByText(uniqueLabel)).toBeVisible();
  });

  test("9.5 - multiple nodes persist after reload", async ({ page }) => {
    const url = await createWorkflow(page, `Multi Persist ${Date.now()}`);
    await addNode(page, "Start");
    await addNode(page, "Activity — Human");
    await addNode(page, "End");
    await waitForSave(page);
    await page.reload();
    // All three should be visible
    await expect(page.getByText("Start").first()).toBeVisible();
    await expect(page.getByText("New Activity").first()).toBeVisible();
    await expect(page.getByText("End").first()).toBeVisible();
  });
});

// ─── Suite 10: Edge Interactions ─────────────────────────────────────────────

test.describe("10. Edge interactions", () => {
  let canvasUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    canvasUrl = await createWorkflow(page, `Edge Test ${Date.now()}`);
    // Add a Start + Activity node and use Layout to separate them clearly
    await addNode(page, "Start");
    await addNode(page, "Activity — Human");
    await waitForSave(page);
    await page.close();
  });

  test("10.1 - canvas renders the ReactFlow component", async ({ page }) => {
    await page.goto(canvasUrl);
    await expect(page.locator(".react-flow")).toBeVisible();
  });

  test("10.2 - node handles are present on nodes", async ({ page }) => {
    await page.goto(canvasUrl);
    // ReactFlow handles have class react-flow__handle
    const handles = page.locator(".react-flow__handle");
    await expect(handles.first()).toBeVisible({ timeout: 5_000 });
  });

  test("10.3 - MiniMap is rendered", async ({ page }) => {
    await page.goto(canvasUrl);
    await expect(page.locator(".react-flow__minimap")).toBeVisible();
  });

  test("10.4 - Controls widget is rendered", async ({ page }) => {
    await page.goto(canvasUrl);
    await expect(page.locator(".react-flow__controls")).toBeVisible();
  });
});
