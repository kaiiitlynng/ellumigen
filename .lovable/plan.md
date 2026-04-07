

## Plan: Replace Top-Bar Mode Toggles with Inline Mini-Panels

### What Changes

Remove the "Chat / Canvas / Code" multi-select toggle bar from the top header. Instead, add **Canvas** and **Code** icon buttons to the **top-right corner of the chat panel**. Clicking one opens a compact, embedded sub-panel below the chat header (or as a bottom drawer within the chat column). Only one can be open at a time — clicking the other switches, clicking the active one closes it.

### Layout Concept

```text
┌─────────────────────────────────────────────┐
│  TopBar  (no mode tabs anymore)             │
├─────────────────────────────────────────────┤
│  Chat Panel Header  [title]   [🎨] [</>]   │  ← Canvas & Code buttons
├─────────────────────────────────────────────┤
│                                             │
│           Chat messages                     │
│           (scrollable)                      │
│                                             │
├─────────────────────────────────────────────┤
│  ┌─ Mini Canvas/Code panel (~35% height) ─┐ │  ← slides up when toggled
│  │  Panel header + close button            │ │
│  │  FreeformView or NotebookView content   │ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│  ChatInput                                  │
└─────────────────────────────────────────────┘
```

When neither is open, chat takes full height as it does today.

### File Changes

1. **`src/components/platform/ModeTabs.tsx`**
   - Remove the `ModeTabs` component (the multi-select toggle bar)
   - Keep `PanelHeader` export (still used)

2. **`src/components/platform/TopBar.tsx`**
   - Remove `activeModes` / `onToggleMode` props and the `ModeTabs` rendering
   - The top bar becomes simpler: just title + Conversation Map + Share + avatar

3. **`src/pages/Index.tsx`**
   - Remove `activeModes` state and `toggleMode` / `toggleCollapse` logic
   - Remove the side-by-side panel layout for Canvas/Code
   - Add new state: `miniPanel: "canvas" | "code" | null`
   - Pass `miniPanel` + `onToggleMiniPanel` down to `ChatView`
   - Chat panel always renders; Canvas/Code render inside it as a sub-panel

4. **`src/components/platform/ChatView.tsx`**
   - Accept new props: `miniPanel`, `onToggleMiniPanel`
   - Add Canvas/Code icon buttons in the chat header area (top-right of chat)
   - When `miniPanel` is set, render a resizable bottom section (~35% height) containing `FreeformView` or `NotebookView`
   - Use a vertical `ResizablePanelGroup` so users can drag the divider
   - Chat messages area shrinks to accommodate the mini-panel

5. **`src/types/chat.ts`**
   - `InterfaceMode` type can be simplified or kept for internal use

### Interaction Details

- **Toggle behavior**: Clicking Canvas when Code is open → switches to Canvas. Clicking Canvas again → closes it. Mutually exclusive.
- **Drag-to-canvas**: When dragging a visualization, auto-open the Canvas mini-panel (preserve existing behavior).
- **Resize**: Users can drag the divider between chat and the mini-panel to adjust proportions.
- **Animation**: Mini-panel slides up with a smooth transition.

### Visual Style

- Mini-panel has a thin header bar with icon + label + close (X) button
- Subtle top border separating it from chat
- Same content as current Canvas/Code views, just in a smaller container

