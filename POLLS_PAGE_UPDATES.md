# Poll Management Page - Updates Summary

## Changes Implemented

### 1. Renamed "Pending" Status to "Scheduled"
- Updated status display across the Polls page.
- Status chips now show "SCHEDULED" instead of "PENDING".
- Filter strip option updated from "Pending" to "Scheduled".
- Stats card updated to show "Scheduled" count.
- **Logic Update**: `status === 'pending'` is now mapped to 'scheduled' in the UI.

### 2. Enhanced Poll Details View
- Added a new section **"Teams / Matches Voted On"** in the Poll Details dialog.
- Lists all matches included in the poll (Home Team vs Away Team).
- Added mock match data to the demo polls to support this view.
- Provides clarity on exactly what users are voting for under each league.

### 3. Improved Poll Creation/Edit UI
- Enhanced the "Teams / Matches in this Poll" section in the creation form.
- Replaced simple text list with **styled cards**.
- Each card clearly shows:
  - **Home Team** (Bold)
  - **vs** label
  - **Away Team** (Bold)
  - **"Match"** badge
- This layout improves readability and clearly indicates the voting context.

### 4. Technical Updates
- Updated `getStatusChip` function to handle 'scheduled' mapping.
- Updated `filterPolls` logic to filter for 'scheduled' status correctly.
- Added `matches` array to `demoPolls` data structure in `PollsPage.js`.

## Files Modified
- `src/pages/PollsPage.js`: Complete rewrite to include new logic and dialog updates.
- `src/pages/PollFormPage.js`: Updated render loop for league fixtures to use card-based layout.

## Testing Recommendations
1. **View Polls List**: Verify "Scheduled" chip appears for previously pending polls.
2. **Filter**: Click "Scheduled" filter and verify it works.
3. **View Details**: Click a poll row (e.g., La Liga or Premier League) and verify the "Teams / Matches Voted On" list appears in the dialog.
4. **Create Poll**: Go to Create Poll page, select a league (e.g., Premier League), and verify the "Teams / Matches" list uses the new card layout.

---
**Status:** ✅ Complete and ready for verification
**Date:** January 24, 2026
