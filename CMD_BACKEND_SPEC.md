# CMd (CeBee Matchday) - Backend Specification

## Overview
CMd is a logical grouping layer for fixtures. Only one CMd can be active (Current) at a time. All fixtures are automatically assigned to the Current CMd.

## Database Schema

### CMd Collection/Table
```
{
  id: string (unique),
  name: string (e.g., "CMd-05"),
  startDate: timestamp,
  endDate: timestamp,
  status: "current" | "completed",
  fixtureCount: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## API Endpoints

### 1. Create CMd
**POST** `/api/cmds`

**Request Body:**
```json
{
  "name": "CMd-06",
  "startDate": "2026-01-27T00:00:00Z",
  "endDate": "2026-02-03T23:59:59Z",
  "status": "current"
}
```

**Response:**
```json
{
  "id": "cmd_001",
  "name": "CMd-06",
  "startDate": "2026-01-27T00:00:00Z",
  "endDate": "2026-02-03T23:59:59Z",
  "status": "current",
  "fixtureCount": 0
}
```

**Business Logic:**
- If status is "current", set all other CMds to "completed"
- Validate: startDate < endDate
- Validate: name is unique

### 2. Get Current CMd
**GET** `/api/cmds/current`

**Response:**
```json
{
  "id": "cmd_001",
  "name": "CMd-05",
  "startDate": "2026-01-20T00:00:00Z",
  "endDate": "2026-01-27T23:59:59Z",
  "status": "current",
  "fixtureCount": 12
}
```

### 3. Get All CMds
**GET** `/api/cmds`

**Query Params:**
- `status` (optional): "current" | "completed"

**Response:**
```json
[
  {
    "id": "cmd_001",
    "name": "CMd-05",
    "status": "current",
    "fixtureCount": 12
  },
  {
    "id": "cmd_002",
    "name": "CMd-04",
    "status": "completed",
    "fixtureCount": 15
  }
]
```

### 4. Update CMd Status
**PATCH** `/api/cmds/:id/status`

**Request Body:**
```json
{
  "status": "current"
}
```

**Business Logic:**
- If setting to "current", mark all other CMds as "completed"

## Usage in Fixture Creation

### Fixture Creation Flow
1. **Before creating fixture:**
   - Call `GET /api/cmds/current` to get the active CMd
   - If no current CMd exists, return error: "No active CMd found"

2. **Create fixture:**
   - **POST** `/api/fixtures`
   - Automatically assign `cmdId` from current CMd
   - Increment `fixtureCount` in CMd document

**Request Body:**
```json
{
  "homeTeam": "Arsenal",
  "awayTeam": "Chelsea",
  "leagueId": "premier_league",
  "kickoffTime": "2026-01-28T15:00:00Z",
  "cmdId": "cmd_001"  // Auto-assigned from current CMd
}
```

**Business Logic:**
- Validate: Current CMd exists
- Auto-assign `cmdId` from current CMd (don't require in request)
- Increment CMd's `fixtureCount`

## Filtering Fixtures by CMd

### Get Fixtures by CMd
**GET** `/api/fixtures`

**Query Params:**
- `cmdId` (optional): Filter by specific CMd ID
- `cmdStatus` (optional): "current" | "completed" | "all"

**Response:**
```json
[
  {
    "id": "MATCH_001",
    "homeTeam": "Arsenal",
    "awayTeam": "Chelsea",
    "cmdId": "cmd_001",
    "cmdName": "CMd-05"
  }
]
```

## Notes
- Only one CMd can have status "current" at any time
- Fixtures cannot exist without a CMd
- When a new CMd is set as "current", all previous CMds become "completed"
- CMd `fixtureCount` is updated automatically when fixtures are created/deleted
