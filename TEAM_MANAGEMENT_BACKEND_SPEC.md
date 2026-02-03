# Team Management Backend Specification

## Overview
Team Management is a foundational module that serves as the single source of truth for football teams. It enforces data integrity across polls, fixtures, predictions, and statistics. Teams are never deleted and must always belong to a league.

---

## 1. Database Schema

### 1.1 Teams Collection/Table

```sql
-- SQL Example (PostgreSQL)
CREATE TABLE teams (
    team_id VARCHAR(50) PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    league_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Inactive')),
    season_tag VARCHAR(20) NOT NULL,
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('Original', 'Promoted')),
    status_reason TEXT,
    status_changed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    
    -- Foreign Key
    CONSTRAINT fk_league FOREIGN KEY (league_id) REFERENCES leagues(league_id),
    
    -- Indexes
    INDEX idx_league_id (league_id),
    INDEX idx_status (status),
    INDEX idx_team_name (team_name),
    INDEX idx_created_at (created_at)
);
```

### 1.2 Team History/Logs Table (Optional - for audit trail)

```sql
CREATE TABLE team_history (
    history_id SERIAL PRIMARY KEY,
    team_id VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'Created', 'Activated', 'Inactivated', 'Promoted', 'Relegated'
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    reason TEXT,
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB, -- Store additional context
    
    CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

CREATE INDEX idx_team_history_team_id ON team_history(team_id);
CREATE INDEX idx_team_history_performed_at ON team_history(performed_at);
```

### 1.3 MongoDB Schema (Alternative)

```javascript
// teams collection
{
  _id: ObjectId,
  team_id: String, // Unique identifier: "TEAM_001"
  team_name: String, // Required, unique per league
  league_id: String, // Required, references leagues collection
  status: String, // "Active" | "Inactive"
  season_tag: String, // "2025-26"
  entry_type: String, // "Original" | "Promoted"
  status_reason: String | null,
  status_changed_at: Date | null,
  created_at: Date,
  created_by: String, // Admin user ID
  updated_at: Date,
  updated_by: String | null,
  
  // Indexes
  // { league_id: 1, status: 1 }
  // { team_name: 1, league_id: 1 } // Unique compound index
  // { status: 1 }
}

// team_history collection
{
  _id: ObjectId,
  team_id: String,
  action_type: String, // "Created" | "Activated" | "Inactivated" | "Promoted" | "Relegated"
  old_status: String | null,
  new_status: String | null,
  reason: String | null,
  performed_by: String, // Admin user ID
  performed_at: Date,
  metadata: Object // Additional context
}
```

---

## 2. API Endpoints

### 2.1 Get All Teams

**Endpoint:** `GET /api/teams`

**Query Parameters:**
- `league_id` (optional): Filter by league ID
- `status` (optional): Filter by status ("Active" | "Inactive")
- `search` (optional): Search by team name or team_id
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `sort_by` (optional): Sort field (default: "created_at")
- `sort_order` (optional): "asc" | "desc" (default: "desc")

**Response:**
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "team_id": "TEAM_001",
        "team_name": "Manchester United",
        "league_id": "LEAGUE_001",
        "league_name": "Premier League",
        "status": "Active",
        "season_tag": "2025-26",
        "entry_type": "Original",
        "status_reason": null,
        "status_changed_at": null,
        "created_at": "2025-01-15T00:00:00Z",
        "created_by": "admin_001",
        "created_by_name": "Super Admin"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "total_pages": 5
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Invalid status filter. Must be 'Active' or 'Inactive'"
  }
}
```

---

### 2.2 Get Team by ID

**Endpoint:** `GET /api/teams/:team_id`

**Response:**
```json
{
  "success": true,
  "data": {
    "team_id": "TEAM_001",
    "team_name": "Manchester United",
    "league_id": "LEAGUE_001",
    "league_name": "Premier League",
    "status": "Active",
    "season_tag": "2025-26",
    "entry_type": "Original",
    "status_reason": null,
    "status_changed_at": null,
    "created_at": "2025-01-15T00:00:00Z",
    "created_by": "admin_001",
    "created_by_name": "Super Admin"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "TEAM_NOT_FOUND",
    "message": "Team with ID TEAM_001 not found"
  }
}
```

---

### 2.3 Create Team

**Endpoint:** `POST /api/teams`

**Request Body:**
```json
{
  "team_name": "Newcastle United",
  "league_id": "LEAGUE_001",
  "season_tag": "2025-26",
  "entry_type": "Original"
}
```

**Validation Rules:**
- `team_name`: Required, string, 1-255 characters, unique within league
- `league_id`: Required, must exist in leagues table
- `season_tag`: Required, string, format: "YYYY-YY" or "YYYY"
- `entry_type`: Required, must be "Original" or "Promoted"

**Response:**
```json
{
  "success": true,
  "data": {
    "team_id": "TEAM_051",
    "team_name": "Newcastle United",
    "league_id": "LEAGUE_001",
    "league_name": "Premier League",
    "status": "Active",
    "season_tag": "2025-26",
    "entry_type": "Original",
    "status_reason": null,
    "status_changed_at": null,
    "created_at": "2025-01-26T10:30:00Z",
    "created_by": "admin_001",
    "created_by_name": "Super Admin"
  },
  "message": "Team created successfully"
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Team name is required",
    "fields": {
      "team_name": "Team name is required"
    }
  }
}
```

**409 - Duplicate Team:**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_TEAM",
    "message": "Team 'Newcastle United' already exists in Premier League"
  }
}
```

**404 - League Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "LEAGUE_NOT_FOUND",
    "message": "League with ID LEAGUE_001 not found"
  }
}
```

---

### 2.4 Activate Team

**Endpoint:** `PATCH /api/teams/:team_id/activate`

**Request Body:**
```json
{
  "reason": "Promoted from Championship",
  "season_tag": "2025-26" // Optional, update season if needed
}
```

**Validation Rules:**
- `reason`: Required, string, 1-500 characters
- Team must be in "Inactive" status
- `season_tag`: Optional, if provided must be valid format

**Response:**
```json
{
  "success": true,
  "data": {
    "team_id": "TEAM_001",
    "status": "Active",
    "status_reason": "Promoted from Championship",
    "status_changed_at": "2025-01-26T10:35:00Z",
    "updated_at": "2025-01-26T10:35:00Z",
    "updated_by": "admin_001"
  },
  "message": "Team activated successfully"
}
```

**Error Responses:**

**400 - Already Active:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Team is already active"
  }
}
```

**400 - Missing Reason:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Reason is required for activation"
  }
}
```

---

### 2.5 Inactivate Team

**Endpoint:** `PATCH /api/teams/:team_id/inactivate`

**Request Body:**
```json
{
  "reason": "Relegated to Championship"
}
```

**Validation Rules:**
- `reason`: Required, string, 1-500 characters
- Team must be in "Active" status

**Business Logic:**
- Check if team is used in any active polls or fixtures
- If used, return warning but allow inactivation (or block based on business rules)
- Update user preferences that reference this team (mark as inactive)

**Response:**
```json
{
  "success": true,
  "data": {
    "team_id": "TEAM_001",
    "status": "Inactive",
    "status_reason": "Relegated to Championship",
    "status_changed_at": "2025-01-26T10:40:00Z",
    "updated_at": "2025-01-26T10:40:00Z",
    "updated_by": "admin_001"
  },
  "message": "Team inactivated successfully",
  "warnings": [
    "Team is currently used in 3 active fixtures"
  ]
}
```

**Error Responses:**

**400 - Already Inactive:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Team is already inactive"
  }
}
```

**409 - Cannot Inactivate (if blocking rule):**
```json
{
  "success": false,
  "error": {
    "code": "TEAM_IN_USE",
    "message": "Cannot inactivate team. It is currently used in active polls or fixtures",
    "details": {
      "active_polls": 2,
      "active_fixtures": 5
    }
  }
}
```

---

### 2.6 Mark Team as Promoted

**Endpoint:** `PATCH /api/teams/:team_id/promote`

**Request Body:**
```json
{
  "season_tag": "2025-26",
  "promotion_date": "2025-06-01",
  "reason": "Won Championship playoffs"
}
```

**Validation Rules:**
- `season_tag`: Required, string, valid format
- `promotion_date`: Required, valid date (ISO 8601)
- `reason`: Optional, string
- Team must exist and be in "Original" entry_type (or allow promotion update)

**Response:**
```json
{
  "success": true,
  "data": {
    "team_id": "TEAM_001",
    "entry_type": "Promoted",
    "season_tag": "2025-26",
    "status_reason": "Promoted on 2025-06-01: Won Championship playoffs",
    "status_changed_at": "2025-06-01T00:00:00Z",
    "updated_at": "2025-01-26T10:45:00Z",
    "updated_by": "admin_001"
  },
  "message": "Team marked as promoted successfully"
}
```

---

### 2.7 Relegate Team

**Endpoint:** `PATCH /api/teams/:team_id/relegate`

**Request Body:**
```json
{
  "reason": "Finished bottom of table",
  "relegation_date": "2025-05-20"
}
```

**Validation Rules:**
- `reason`: Required, string, 1-500 characters
- `relegation_date`: Optional, valid date
- Team must be in "Active" status

**Response:**
```json
{
  "success": true,
  "data": {
    "team_id": "TEAM_001",
    "status": "Inactive",
    "status_reason": "Relegated: Finished bottom of table",
    "status_changed_at": "2025-05-20T00:00:00Z",
    "updated_at": "2025-01-26T10:50:00Z",
    "updated_by": "admin_001"
  },
  "message": "Team relegated successfully"
}
```

---

### 2.8 Get Team History

**Endpoint:** `GET /api/teams/:team_id/history`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "team": {
      "team_id": "TEAM_001",
      "team_name": "Manchester United",
      "current_status": "Active"
    },
    "history": [
      {
        "history_id": "HIST_001",
        "action_type": "Created",
        "old_status": null,
        "new_status": "Active",
        "reason": null,
        "performed_by": "admin_001",
        "performed_by_name": "Super Admin",
        "performed_at": "2025-01-15T00:00:00Z",
        "metadata": {}
      },
      {
        "history_id": "HIST_002",
        "action_type": "Inactivated",
        "old_status": "Active",
        "new_status": "Inactive",
        "reason": "Relegated to Championship",
        "performed_by": "admin_002",
        "performed_by_name": "Support Admin",
        "performed_at": "2025-05-20T12:00:00Z",
        "metadata": {
          "relegation_date": "2025-05-20"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "total_pages": 1
    }
  }
}
```

---

### 2.9 Get Teams by League

**Endpoint:** `GET /api/leagues/:league_id/teams`

**Query Parameters:**
- `status` (optional): Filter by status
- `active_only` (optional, boolean): Return only active teams (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "league_id": "LEAGUE_001",
    "league_name": "Premier League",
    "teams": [
      {
        "team_id": "TEAM_001",
        "team_name": "Manchester United",
        "status": "Active",
        "season_tag": "2025-26",
        "entry_type": "Original"
      }
    ],
    "total": 20,
    "active_count": 18,
    "inactive_count": 2
  }
}
```

---

### 2.10 Get Team Statistics

**Endpoint:** `GET /api/teams/statistics`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_teams": 150,
    "active_teams": 120,
    "inactive_teams": 30,
    "promoted_teams": 15,
    "by_league": {
      "LEAGUE_001": {
        "total": 20,
        "active": 18,
        "inactive": 2
      }
    }
  }
}
```

---

## 3. Business Logic & Validation Rules

### 3.1 Team Creation Rules

1. **Team Name Uniqueness:**
   - Team name must be unique within the same league
   - Case-insensitive comparison
   - Trim whitespace before validation

2. **League Validation:**
   - League must exist and be active (optional check)
   - League must allow team creation

3. **Team ID Generation:**
   - Format: `TEAM_XXX` where XXX is zero-padded number
   - Auto-increment based on existing teams
   - Ensure uniqueness

4. **Default Values:**
   - `status`: "Active"
   - `created_at`: Current timestamp
   - `created_by`: Current admin user ID

### 3.2 Status Transition Rules

1. **Activation:**
   - Only "Inactive" teams can be activated
   - Reason is mandatory
   - Update `status_changed_at` timestamp
   - Log action in history

2. **Inactivation:**
   - Only "Active" teams can be inactivated
   - Reason is mandatory
   - Check for active usage (polls, fixtures) - warn or block based on config
   - Update user preferences if team becomes inactive
   - Log action in history

3. **Promotion:**
   - Can be applied to any team
   - Updates `entry_type` to "Promoted"
   - Updates `season_tag`
   - Sets status to "Active" if currently inactive
   - Logs promotion date and reason

4. **Relegation:**
   - Only "Active" teams can be relegated
   - Automatically sets status to "Inactive"
   - Reason is mandatory
   - Logs relegation date and reason

### 3.3 Data Integrity Rules

1. **No Deletion:**
   - Teams are NEVER deleted
   - Soft delete is not implemented
   - Historical data must be preserved

2. **League Dependency:**
   - Teams cannot exist without a league
   - If league is deleted (if allowed), teams must be handled (migrate or mark inactive)

3. **Referential Integrity:**
   - When team status changes, update related entities:
     - User preferences (mark team as inactive)
     - Poll options (hide inactive teams)
     - Fixture creation (prevent inactive team selection)

### 3.4 Integration Points

1. **Polls Module:**
   - Only active teams can be selected in polls
   - When team becomes inactive, remove from active polls (or mark as invalid)

2. **Fixtures Module:**
   - Only active teams can be used in fixtures
   - Existing fixtures with inactive teams should be marked or handled appropriately

3. **Predictions Module:**
   - Predictions reference teams by ID
   - Historical predictions remain valid even if team becomes inactive

4. **User Preferences:**
   - When team becomes inactive, update user preferences
   - Notify users if their favorite team becomes inactive

---

## 4. Error Handling

### 4.1 Error Codes

```javascript
const ERROR_CODES = {
  // Validation Errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  
  // Not Found Errors (404)
  TEAM_NOT_FOUND: 'TEAM_NOT_FOUND',
  LEAGUE_NOT_FOUND: 'LEAGUE_NOT_FOUND',
  
  // Conflict Errors (409)
  DUPLICATE_TEAM: 'DUPLICATE_TEAM',
  TEAM_IN_USE: 'TEAM_IN_USE',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  
  // Server Errors (500)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR'
};
```

### 4.2 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}, // Optional additional context
    "timestamp": "2025-01-26T10:00:00Z"
  }
}
```

---

## 5. Authentication & Authorization

### 5.1 Required Permissions

- **View Teams:** All authenticated admins
- **Create Team:** Super Admin, Support Admin (with team management permission)
- **Activate/Inactivate:** Super Admin, Support Admin (with team management permission)
- **Promote/Relegate:** Super Admin only (or configurable)
- **View History:** All authenticated admins

### 5.2 Authorization Middleware

```javascript
// Example middleware
const requireTeamManagement = (req, res, next) => {
  const user = req.user;
  if (!user.permissions.includes('team:manage')) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Insufficient permissions to manage teams'
      }
    });
  }
  next();
};
```

---

## 6. Database Indexes

### 6.1 Required Indexes

```sql
-- Performance indexes
CREATE INDEX idx_teams_league_status ON teams(league_id, status);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_teams_name_league ON teams(team_name, league_id);
CREATE INDEX idx_teams_created_at ON teams(created_at DESC);

-- Unique constraint
CREATE UNIQUE INDEX idx_teams_unique_name_league ON teams(LOWER(team_name), league_id);
```

---

## 7. API Rate Limiting

- **GET requests:** 100 requests per minute per IP
- **POST/PATCH requests:** 20 requests per minute per user
- **Admin endpoints:** Higher limits (50 requests per minute)

---

## 8. Caching Strategy

### 8.1 Cache Keys

- `teams:league:{league_id}:active` - Active teams by league (TTL: 5 minutes)
- `teams:league:{league_id}:all` - All teams by league (TTL: 10 minutes)
- `teams:statistics` - Team statistics (TTL: 1 minute)

### 8.2 Cache Invalidation

- Invalidate cache on team creation, status change, or update
- Use cache tags for efficient invalidation

---

## 9. Testing Requirements

### 9.1 Unit Tests

- Team creation validation
- Status transition logic
- Duplicate team name detection
- League validation

### 9.2 Integration Tests

- Team creation flow
- Status change flow with history logging
- League-team relationship
- Error handling

### 9.3 Test Data

```javascript
// Sample test data
const testTeams = [
  {
    team_id: 'TEAM_TEST_001',
    team_name: 'Test Team 1',
    league_id: 'LEAGUE_001',
    status: 'Active',
    season_tag: '2025-26',
    entry_type: 'Original',
    created_by: 'test_admin'
  }
];
```

---

## 10. Implementation Checklist

- [ ] Database schema creation
- [ ] API endpoint implementation
- [ ] Validation logic
- [ ] Business rule enforcement
- [ ] History/audit logging
- [ ] Error handling
- [ ] Authentication/authorization
- [ ] Caching implementation
- [ ] Rate limiting
- [ ] Unit tests
- [ ] Integration tests
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Performance optimization
- [ ] Security audit

---

## 11. Example Implementation (Node.js/Express)

```javascript
// routes/teams.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const TeamController = require('../controllers/TeamController');
const { authenticate, requirePermission } = require('../middleware/auth');

// Get all teams
router.get(
  '/',
  [
    query('league_id').optional().isString(),
    query('status').optional().isIn(['Active', 'Inactive']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  authenticate,
  TeamController.getAllTeams
);

// Get team by ID
router.get(
  '/:team_id',
  [param('team_id').isString().notEmpty()],
  authenticate,
  TeamController.getTeamById
);

// Create team
router.post(
  '/',
  [
    body('team_name').trim().isLength({ min: 1, max: 255 }),
    body('league_id').isString().notEmpty(),
    body('season_tag').matches(/^\d{4}(-\d{2})?$/),
    body('entry_type').isIn(['Original', 'Promoted'])
  ],
  authenticate,
  requirePermission('team:manage'),
  TeamController.createTeam
);

// Activate team
router.patch(
  '/:team_id/activate',
  [
    param('team_id').isString().notEmpty(),
    body('reason').trim().isLength({ min: 1, max: 500 })
  ],
  authenticate,
  requirePermission('team:manage'),
  TeamController.activateTeam
);

// Inactivate team
router.patch(
  '/:team_id/inactivate',
  [
    param('team_id').isString().notEmpty(),
    body('reason').trim().isLength({ min: 1, max: 500 })
  ],
  authenticate,
  requirePermission('team:manage'),
  TeamController.inactivateTeam
);

// Get team history
router.get(
  '/:team_id/history',
  [param('team_id').isString().notEmpty()],
  authenticate,
  TeamController.getTeamHistory
);

module.exports = router;
```

```javascript
// controllers/TeamController.js
const TeamService = require('../services/TeamService');

class TeamController {
  static async getAllTeams(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid parameters',
            details: errors.array()
          }
        });
      }

      const { league_id, status, search, page, limit, sort_by, sort_order } = req.query;
      const result = await TeamService.getAllTeams({
        league_id,
        status,
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sort_by: sort_by || 'created_at',
        sort_order: sort_order || 'desc'
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        }
      });
    }
  }

  static async createTeam(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            fields: errors.mapped()
          }
        });
      }

      const { team_name, league_id, season_tag, entry_type } = req.body;
      const created_by = req.user.id;

      const team = await TeamService.createTeam({
        team_name: team_name.trim(),
        league_id,
        season_tag,
        entry_type,
        created_by
      });

      res.status(201).json({
        success: true,
        data: team,
        message: 'Team created successfully'
      });
    } catch (error) {
      if (error.code === 'DUPLICATE_TEAM') {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_TEAM',
            message: error.message
          }
        });
      }

      if (error.code === 'LEAGUE_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'LEAGUE_NOT_FOUND',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        }
      });
    }
  }

  // ... other controller methods
}

module.exports = TeamController;
```

---

## 12. Notes for Backend Developer

1. **Team ID Generation:** Implement a robust ID generation system that ensures uniqueness even with concurrent requests.

2. **Transaction Management:** Use database transactions for operations that modify multiple related records (e.g., status change + history log).

3. **Soft Delete:** Although teams are never deleted, consider implementing soft delete for audit purposes if required.

4. **Bulk Operations:** Consider adding bulk import/export endpoints for initial data seeding.

5. **Search Optimization:** Implement full-text search if team names need advanced search capabilities.

6. **Webhooks/Events:** Consider emitting events when team status changes for other services to react (e.g., update caches, notify users).

7. **Migration Scripts:** Create migration scripts for initial team data import from existing systems.

8. **API Versioning:** Use API versioning (`/api/v1/teams`) for future compatibility.

---

## Contact & Support

For questions or clarifications about this specification, contact the development team lead.

**Last Updated:** January 26, 2025
**Version:** 1.0
