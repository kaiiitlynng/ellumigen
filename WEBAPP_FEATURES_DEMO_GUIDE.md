# Ellumigen Webapp Feature & Demo Guide

This guide summarizes the webapp structure under `src/` and provides practical demo instructions for key flows, especially:

- graph visualizations
- to-do style task execution
- making skills (methods)
- branching and merging inside chat
- and other notable features

## 1) App Structure (from `src/`)

## Core App Shell

- `src/App.tsx`: top-level providers + routing.
  - Route `/` -> `Index`
  - Catch-all -> `NotFound`
- `src/pages/Index.tsx`: central coordinator for stateful app behavior and view switching.

## Major Platform Views

- `src/components/platform/AppSidebar.tsx`
  - Navigation: Workspace, History, Artifacts, Methods, Suggestions
  - Chat list and current chat branch tree
  - Bookmark collections
- `src/components/platform/TopBar.tsx`
  - Chat title/status
  - Conversation Map toggle
  - Branch context controls (`Merge to Main`, `Return to Main`)
- `src/components/platform/ChatView.tsx`
  - Main chat stream + message rendering
  - Plan/execution rendering
  - Visualization rendering (table + volcano + heatmap)
  - Bookmarking + branching actions per assistant message
  - Mini panels: `Canvas` (freeform) and `Code` (notebook)
- `src/components/platform/WorkspaceView.tsx`
  - Overview dashboard + quickstart templates
- `src/components/platform/HistoryView.tsx`
  - History tabs: chats/datasets/documents with sort
- `src/components/platform/ArtifactsView.tsx`
  - Dataset browser with filtering, search, and details
- `src/components/platform/MethodsView.tsx`
  - Built-in methods + user-created methods
- `src/components/platform/UseCasesView.tsx`
  - Workflow cards for computational biology scenarios
- `src/components/platform/ConversationMap.tsx`
  - Branch graph visualization with merge connectors
- `src/components/platform/FreeformView.tsx`
  - Canvas with draggable notes/text/charts and dropped visualizations
- `src/components/platform/NotebookView.tsx`
  - Notebook-style code/markdown cells, run simulation, reorder

## State & Domain Logic

- `src/stores/chatStore.ts`
  - Chat CRUD basics (create/select/rename)
  - Message add/remove/update metadata
  - Branch create/switch/merge
  - Bookmark + bookmark collection management
- `src/stores/customMethodsStore.ts`
  - User methods persisted in `localStorage` (`ellumigen.customMethods.v1`)
- `src/lib/branchTreeBuilder.ts`
  - Converts chat + branches into tree/map nodes
  - Category/status inference
  - Merge metadata for branch visualizations
- `src/lib/defaultMethods.ts`
  - Built-in slash methods
- `src/types/chat.ts`
  - Core types for messages, metadata, plans, execution steps, branches

## 2) Functionalities Inventory

## Chat + Prompting

- New chat creation and selection
- Multi-line chat input with Enter-to-send
- Suggestion chips for quick prompts
- Context-help trigger (`help` keyword)
- AI fallback endpoint call via Supabase Edge Function (`/functions/v1/chat`)

## Context Tokens in Input

- `@` mention menu for datasets/files (e.g., `@TCGA-BRCA`)
- `/` menu for methods (built-in + custom)
- Keyboard support for dropdown (up/down/enter/tab/esc)

## Methods / Skills-like Commands

- Built-in method catalog:
  - `/statistical-analysis`
  - `/pathway-enrichment`
  - `/clustering`
  - `/dimensionality-reduction`
- Create custom methods in Methods view
  - Slugified names
  - Deduped by slug
  - Persisted locally

## Plan + Execution Workflow

- Triggered by messages containing `analyze`
- Renders a proposed response plan with approval/rejection
- On approval:
  - execution steps progress UI
  - thought process stream
  - final formatted markdown result

## Data Table + Graph Visualizations

- Keyword-triggered response path (graph/chart/plot/visuali/table/dataset/findings/outliers/heatmap/volcano)
- Assistant message with metadata type `visualizations`
- Renders:
  - Data table
  - Volcano plot
  - Heatmap chart
- Visualizations are draggable into canvas (`application/ellumigen-viz`)

## Branching + Merging in Chat

- Branch from any assistant response via branch action
- Branch starts as isolated message thread (blank slate)
- Switch between main and branch contexts
- Merge branch back to main (marks branch merged)
- Branch context banner with merge/return actions
- Sidebar branch tree + full Conversation Map

## Bookmarks

- Bookmark individual assistant messages
- Organize into bookmark collections
- Create new collections dynamically
- Sidebar displays collection counts

## Workspace / History / Artifacts / Use Cases

- Workspace overview cards and quickstart template chats
- History with tabs and sort modes
- Artifact dataset browser:
  - Search by name/description/tags
  - Type filters (all/expression/clinical/genomic/imaging)
  - Expand rows for metadata and actions
- Use case library with workflow steps and tools

## Canvas + Notebook Mini Panels

- Toggle mini panel from chat:
  - `Canvas`: pan/zoom, add notes/text, drag/drop visualizations
  - `Code`: notebook cells (code + markdown), run all, reorder, collapse
- Fullscreen mini panel mode

## 3) Demo Instructions (Step-by-Step)

Use these scripts in a live demo. Each section includes a short expected outcome.

## A) Graph Visualizations Demo (Volcano + Heatmap + Table)

1. Open a chat (`New Chat` or existing).
2. Send a prompt with visualization keywords, for example:
   - `Show me a volcano plot and heatmap for @TCGA-BRCA findings.`
3. Wait for assistant response.

Expected outcome:

- Assistant returns explanatory text plus:
  - data table
  - volcano plot
  - heatmap
- Each visual block is wrapped as draggable content.

Bonus move:

4. Open mini panel `Canvas`.
5. Drag the volcano/heatmap/table cards into the canvas area.

Expected outcome:

- Dropped visualizations become movable canvas nodes.

## B) To-Do List / Task Execution Demo

There is no standalone checklist app, but there is a task-list style execution UI in chat.

1. In chat, send a prompt containing `analyze`, e.g.:
   - `Analyze @TCGA-BRCA with /statistical-analysis`
2. A proposed plan appears.
3. Click **Approve**.

Expected outcome:

- Execution panel appears with multiple steps transitioning:
  - pending -> running -> complete
- Thought process entries stream progressively.
- Final analysis response appears after steps complete.

Demo narration tip:

- Describe this as "a built-in workflow to-do tracker for analysis tasks."

## C) Making Skills (Methods) Demo

In this app, "skills" map to slash methods.

1. Open **Methods** in sidebar.
2. Under **New method**, create:
   - Name: `survival-prognosis`
   - Description: `Estimate prognosis patterns across clinical subgroups`
3. Click **Create method**.
4. Return to chat and type `/`.

Expected outcome:

- New custom method appears in the slash dropdown (custom methods are listed first).
- Method persists in local storage and remains available across reloads.

Optional cleanup:

5. Return to Methods and delete the created method using trash icon.

## D) Branching and Merging Inside Chat Demo

1. Run a small exchange in chat (at least one assistant response).
2. On an assistant message, click the **Branch** icon (git branch symbol).
3. You are now in branch context (banner appears in top bar).
4. Send one or two branch-only messages.
5. Open **Map** from top bar to show conversation topology.
6. Click **Merge to Main** in branch banner.

Expected outcome:

- Branch is marked merged.
- UI returns to main thread.
- Branch remains visible in map/tree with merged state.

Extra:

7. Use **Return to Main** without merging to show non-destructive branch navigation.

## E) Additional Demo Features ("and more")

## Bookmarks + Collections

1. On an assistant response, open bookmark popover and bookmark it.
2. Add it to an existing collection (or create one).

Expected outcome:

- Sidebar bookmark section updates counts by collection.

## Artifacts + Dataset Context

1. Open **Artifacts**.
2. Search `TCGA` and filter by `Expression`.
3. Expand a dataset card and highlight tags/source.
4. Go to chat and mention `@TCGA-BRCA`.

Expected outcome:

- Demonstrates dataset discovery plus contextual referencing in chat.

## Canvas Ideation

1. Open `Canvas` mini panel.
2. Add note and text blocks.
3. Pan/zoom and reposition nodes.

Expected outcome:

- Shows whiteboard-style synthesis layer for findings/hypotheses.

## Notebook Simulation

1. Open `Code` mini panel.
2. Run a single code cell, then **Run All**.
3. Collapse/expand cells and reorder by drag handle.

Expected outcome:

- Interactive notebook experience with simulated outputs.

## 4) Recommended End-to-End Demo Flow (10-15 min)

1. Start in **Workspace** -> launch a quickstart template.
2. In chat, run **graph visualization** prompt.
3. Drag visualizations to **Canvas**.
4. Trigger **analyze** plan -> approve to show task execution.
5. Create a custom method in **Methods** and use it via `/`.
6. Show **branching and merge** with Conversation Map.
7. Save a key message as **bookmark**.
8. Close in **Artifacts** showing `@dataset` context pattern.

## 5) Notes / Caveats

- Several parts are demo-oriented with curated sample data and simulated execution.
- Branch merge currently marks branch merged; it does not splice branch messages into main thread.
- Custom methods are client-local (browser storage), not multi-user synced.
- Graph rendering in this codebase is primarily volcano/heatmap/table components in chat and canvas.

