# Leaderboard Control and Filtering Updates

I have updated the Leaderboard and Leaderboard Details pages to support dynamic period filtering (Monthly vs All Time).

## 1. Leaderboard Page (`LeaderboardPage.js`)
- **Default View**: Changed to **"Monthly SP Leaders"** (was All Time).
- **Data Handling**: 
  - Implemented logic to generate "Monthly" mock data derived from the static "All Time" data.
  - "Monthly" entries have appropriately scaled down points and separate IDs.
- **Global Filtering**:
  - The "Period" filter now affects **Main Stats Cards** (Total Participants, Top Scorer coverage, etc.) in addition to the table list.
  - Switching between Monthly/All Time immediately updates all numbers on the dashboard.
- **Navigation**:
  - Clicking "View Details" or a Table Row now passes the `period` context (e.g., `?period=monthly`) to the details page.

## 2. Leaderboard Details Page (`LeaderboardDetailsPage.js`)
- **Context Awareness**:
  - Now reads the `?period=...` query parameter from the URL.
- **Dynamic Stats**:
  - `generateDummyUserData` now adjusts the displayed statistics (SP Total, Accuracy, Predictions) based on the selected period.
  - Rank badge and tags (e.g., `LBMO_` vs `LBAT_`) update dynamically.
- **UI Updates**:
  - The "Period" card at the bottom right now explicitly shows "Monthly" or "All Time" based on the active filter.

## Verification
- **Default Load**: Open Leaderboard. Verify it says "Monthly SP Leaders" and stats reflect monthly values.
- **Switch Filter**: Select "All Time Leaders". Verify table expands/changes and Top Scorer points increase significantly.
- **Details View**: Click on a user. Verify the Details Page shows "Monthly Points" (if starting from Monthly view) and the URL contains `?period=monthly`.

These changes ensure a consistent and interconnected filtering experience across the leaderboard module.
