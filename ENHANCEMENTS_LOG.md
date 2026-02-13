# Admin Enhancement Log (Feb 09, 2026)

## 1. Fixture Management
- **Hierarchical Display:** Added `CMd-XX • MatchID` context to lists for better history tracking.
- **Advanced Filtering:** Introduced a collapsible "History & Ranges" section for deep analysis.
  - **CMd Ranges:** Filter by specific spans (e.g., `Cmd-01` to `Cmd-05`).
  - **Date Presets:** Quick filters for Last Week, Last Month, and Last 3 Months.
- **Smart Logic:** Range filters auto-switch context to "All-time" to prevent conflicts.

## 2. League Management
- **Status Toggles:** Unlocked toggles when at max capacity (5 active leagues).
- **Sync Fix:** Toggles now send `status` + `isActive` and auto-refresh the list.
- **Visuals:** Removed confusing lock icons; fixed "disabled" UI state.

## 3. Technical Stability
- **Dependencies:** Fixed missing MUI imports (`FormControl`, `InputLabel`).
- **Reliability:** Implemented case-insensitive status mapping for consistent UI.
