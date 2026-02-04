/**
 * Fixtures Service
 * Handles all fixture-related API calls
 */

import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './apiBase';

/**
 * Get all fixtures with filtering, search, pagination, and sorting
 * @param {object} params - Query parameters (status, cmdId, cmdStatus, search, page, limit, sort_by, sort_order)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getFixtures = async (params = {}) => {
  try {
    const response = await apiGet('/fixtures', params);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: { fixtures: [], pagination: {} },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch fixtures',
      data: { fixtures: [], pagination: {} },
    };
  }
};

/**
 * Get fixture by ID
 * @param {string} fixtureId - Fixture ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getFixture = async (fixtureId) => {
  try {
    const response = await apiGet(`/fixtures/${fixtureId}`);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch fixture',
    };
  }
};

/**
 * Create new fixture
 * @param {object} fixtureData - Fixture data (homeTeam, awayTeam, leagueId, kickoffTime, venue, cmdId)
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const createFixture = async (fixtureData) => {
  try {
    // Validate required fields
    if (!fixtureData.homeTeam || !fixtureData.homeTeam.trim()) {
      return {
        success: false,
        error: 'Home team is required',
      };
    }

    if (!fixtureData.awayTeam || !fixtureData.awayTeam.trim()) {
      return {
        success: false,
        error: 'Away team is required',
      };
    }

    if (!fixtureData.leagueId || !fixtureData.leagueId.trim()) {
      return {
        success: false,
        error: 'League ID is required',
      };
    }

    if (!fixtureData.kickoffTime) {
      return {
        success: false,
        error: 'Kickoff time is required',
      };
    }

    // Format the request body to match backend expectations
    const requestBody = {
      homeTeam: fixtureData.homeTeam.trim(),
      awayTeam: fixtureData.awayTeam.trim(),
      leagueId: fixtureData.leagueId,
      kickoffTime: fixtureData.kickoffTime instanceof Date 
        ? fixtureData.kickoffTime.toISOString() 
        : fixtureData.kickoffTime,
    };

    // Optional fields
    if (fixtureData.venue) {
      requestBody.venue = fixtureData.venue;
    }

    if (fixtureData.cmdId) {
      requestBody.cmdId = fixtureData.cmdId;
    }

    if (fixtureData.matchStatus) {
      requestBody.matchStatus = fixtureData.matchStatus;
    }

    console.log('Creating fixture - fixtureData received:', fixtureData);
    console.log('Creating fixture - requestBody being sent:', requestBody);
    
    const response = await apiPost('/fixtures', requestBody);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Fixture created successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to create fixture',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while creating fixture',
    };
  }
};

/**
 * Update fixture
 * @param {string} fixtureId - Fixture ID
 * @param {object} fixtureData - Updated fixture data
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const updateFixture = async (fixtureId, fixtureData) => {
  try {
    if (!fixtureId) {
      return {
        success: false,
        error: 'Fixture ID is required',
      };
    }

    // Format the request body to match backend expectations
    const requestBody = {};
    
    if (fixtureData.homeTeam) {
      requestBody.homeTeam = fixtureData.homeTeam.trim();
    }
    
    if (fixtureData.awayTeam) {
      requestBody.awayTeam = fixtureData.awayTeam.trim();
    }
    
    if (fixtureData.leagueId) {
      requestBody.leagueId = fixtureData.leagueId;
    }
    
    if (fixtureData.kickoffTime) {
      requestBody.kickoffTime = fixtureData.kickoffTime instanceof Date 
        ? fixtureData.kickoffTime.toISOString() 
        : fixtureData.kickoffTime;
    }

    if (fixtureData.venue !== undefined) {
      requestBody.venue = fixtureData.venue;
    }

    if (fixtureData.cmdId) {
      requestBody.cmdId = fixtureData.cmdId;
    }

    if (fixtureData.matchStatus) {
      requestBody.matchStatus = fixtureData.matchStatus;
    }

    console.log('Updating fixture - fixtureData received:', fixtureData);
    console.log('Updating fixture - requestBody being sent:', requestBody);
    
    const response = await apiPut(`/fixtures/${fixtureId}`, requestBody);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Fixture updated successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to update fixture',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while updating fixture',
    };
  }
};

/**
 * Update fixture status
 * @param {string} fixtureId - Fixture ID
 * @param {string} status - New status (scheduled, published, predictionLocked, live, resultsProcessing, completed)
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const updateFixtureStatus = async (fixtureId, status) => {
  try {
    if (!fixtureId) {
      return {
        success: false,
        error: 'Fixture ID is required',
      };
    }

    if (!status) {
      return {
        success: false,
        error: 'Status is required',
      };
    }

    const response = await apiPatch(`/fixtures/${fixtureId}/status`, { status });
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Fixture status updated successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to update fixture status',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while updating fixture status',
    };
  }
};

/**
 * Update fixture results
 * @param {string} fixtureId - Fixture ID
 * @param {object} resultsData - Results data (homeScore, awayScore, firstGoalScorer, firstGoalMinute, markCompleted)
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const updateFixtureResults = async (fixtureId, resultsData) => {
  try {
    if (!fixtureId) {
      return {
        success: false,
        error: 'Fixture ID is required',
      };
    }

    // Validate required fields
    if (resultsData.homeScore === undefined || resultsData.homeScore === null || resultsData.homeScore === '') {
      return {
        success: false,
        error: 'Home score is required',
      };
    }

    if (resultsData.awayScore === undefined || resultsData.awayScore === null || resultsData.awayScore === '') {
      return {
        success: false,
        error: 'Away score is required',
      };
    }

    if (resultsData.markCompleted) {
      // If marking as completed, first goal scorer and minute are required
      if (!resultsData.firstGoalScorer || !resultsData.firstGoalScorer.trim()) {
        return {
          success: false,
          error: 'First goal scorer is required when marking as completed',
        };
      }

      if (!resultsData.firstGoalMinute || resultsData.firstGoalMinute === '') {
        return {
          success: false,
          error: 'First goal minute is required when marking as completed',
        };
      }
    }

    // Format the request body
    const requestBody = {
      homeScore: parseInt(resultsData.homeScore, 10),
      awayScore: parseInt(resultsData.awayScore, 10),
    };

    if (resultsData.firstGoalScorer) {
      requestBody.firstGoalScorer = resultsData.firstGoalScorer.trim();
    }

    if (resultsData.firstGoalMinute) {
      requestBody.firstGoalMinute = parseInt(resultsData.firstGoalMinute, 10);
    }

    if (resultsData.markCompleted !== undefined) {
      requestBody.markCompleted = resultsData.markCompleted;
    }

    console.log('Updating fixture results - resultsData received:', resultsData);
    console.log('Updating fixture results - requestBody being sent:', requestBody);
    
    const response = await apiPatch(`/fixtures/${fixtureId}/results`, requestBody);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Fixture results updated successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to update fixture results',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while updating fixture results',
    };
  }
};

/**
 * Delete fixture
 * @param {string} fixtureId - Fixture ID
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const deleteFixture = async (fixtureId) => {
  try {
    if (!fixtureId) {
      return {
        success: false,
        error: 'Fixture ID is required',
      };
    }

    const response = await apiDelete(`/fixtures/${fixtureId}`);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Fixture deleted successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to delete fixture',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while deleting fixture',
    };
  }
};

/**
 * Get fixtures by CMd
 * @param {string} cmdId - CMd ID
 * @param {object} params - Additional query parameters
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getFixturesByCmd = async (cmdId, params = {}) => {
  try {
    const queryParams = { ...params, cmdId };
    const response = await apiGet('/fixtures', queryParams);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: { fixtures: [], pagination: {} },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch fixtures by CMd',
      data: { fixtures: [], pagination: {} },
    };
  }
};

/**
 * Get fixtures by status
 * @param {string} status - Fixture status
 * @param {object} params - Additional query parameters
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getFixturesByStatus = async (status, params = {}) => {
  try {
    const queryParams = { ...params, status };
    const response = await apiGet('/fixtures', queryParams);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: { fixtures: [], pagination: {} },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch fixtures by status',
      data: { fixtures: [], pagination: {} },
    };
  }
};

/**
 * Approve match details
 * @param {string} fixtureId - Fixture ID
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const approveFixture = async (fixtureId) => {
  try {
    if (!fixtureId) {
      return {
        success: false,
        error: 'Fixture ID is required',
      };
    }

    const response = await apiPatch(`/fixtures/${fixtureId}/approve`, {});
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Match details approved successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to approve match details',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while approving match details',
    };
  }
};

/**
 * Publish fixture (move from scheduled to published)
 * @param {string} fixtureId - Fixture ID
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const publishFixture = async (fixtureId) => {
  try {
    if (!fixtureId) {
      return {
        success: false,
        error: 'Fixture ID is required',
      };
    }

    const response = await apiPatch(`/fixtures/${fixtureId}/publish`, {});
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Fixture published successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to publish fixture',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while publishing fixture',
    };
  }
};

/**
 * Lock predictions for fixture
 * @param {string} fixtureId - Fixture ID
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const lockFixturePredictions = async (fixtureId) => {
  try {
    if (!fixtureId) {
      return {
        success: false,
        error: 'Fixture ID is required',
      };
    }

    const response = await apiPatch(`/fixtures/${fixtureId}/lock`, {});
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Predictions locked successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to lock predictions',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while locking predictions',
    };
  }
};

/**
 * Start live match
 * @param {string} fixtureId - Fixture ID
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const startLiveMatch = async (fixtureId) => {
  try {
    if (!fixtureId) {
      return {
        success: false,
        error: 'Fixture ID is required',
      };
    }

    const response = await apiPatch(`/fixtures/${fixtureId}/start-live`, {});
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Match started successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to start live match',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while starting live match',
    };
  }
};

/**
 * End match (move to resultsProcessing status)
 * @param {string} fixtureId - Fixture ID
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const endMatch = async (fixtureId) => {
  try {
    if (!fixtureId) {
      return {
        success: false,
        error: 'Fixture ID is required',
      };
    }

    const response = await apiPatch(`/fixtures/${fixtureId}/end`, {});
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Match ended successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to end match',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while ending match',
    };
  }
};

/**
 * Get predictions for a fixture
 * @param {string} fixtureId - Fixture ID
 * @param {object} params - Query parameters (page, limit, search, sort_by, sort_order)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getFixturePredictions = async (fixtureId, params = {}) => {
  try {
    if (!fixtureId) {
      return {
        success: false,
        error: 'Fixture ID is required',
      };
    }

    const response = await apiGet(`/fixtures/${fixtureId}/predictions`, params);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: { predictions: [], pagination: {} },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch fixture predictions',
      data: { predictions: [], pagination: {} },
    };
  }
};

/**
 * Get fixture statistics
 * @param {string} fixtureId - Fixture ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getFixtureStats = async (fixtureId) => {
  try {
    if (!fixtureId) {
      return {
        success: false,
        error: 'Fixture ID is required',
      };
    }

    const response = await apiGet(`/fixtures/${fixtureId}/stats`);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch fixture statistics',
    };
  }
};

/**
 * Get fixture timeline/events
 * @param {string} fixtureId - Fixture ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getFixtureTimeline = async (fixtureId) => {
  try {
    if (!fixtureId) {
      return {
        success: false,
        error: 'Fixture ID is required',
      };
    }

    const response = await apiGet(`/fixtures/${fixtureId}/timeline`);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: { events: [] },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch fixture timeline',
      data: { events: [] },
    };
  }
};

/**
 * Bulk update fixture statuses
 * @param {Array<string>} fixtureIds - Array of fixture IDs
 * @param {string} status - New status
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const bulkUpdateFixtureStatus = async (fixtureIds, status) => {
  try {
    if (!fixtureIds || !Array.isArray(fixtureIds) || fixtureIds.length === 0) {
      return {
        success: false,
        error: 'Fixture IDs array is required',
      };
    }

    if (!status) {
      return {
        success: false,
        error: 'Status is required',
      };
    }

    const response = await apiPatch('/fixtures/bulk-status', {
      fixtureIds,
      status,
    });
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Fixture statuses updated successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to update fixture statuses',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while updating fixture statuses',
    };
  }
};

/**
 * Get fixture summary/overview
 * @param {string} fixtureId - Fixture ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getFixtureSummary = async (fixtureId) => {
  try {
    if (!fixtureId) {
      return {
        success: false,
        error: 'Fixture ID is required',
      };
    }

    const response = await apiGet(`/fixtures/${fixtureId}/summary`);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch fixture summary',
    };
  }
};
