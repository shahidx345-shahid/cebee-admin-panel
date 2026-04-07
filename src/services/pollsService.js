/**
 * Polls Service
 * Handles all poll-related API calls
 */

import { apiGet, apiPost, apiPut, apiPatch } from './apiBase';

const POLL_FIXTURES_MIN = 2;
const POLL_FIXTURES_MAX = 8;

/**
 * Get all polls with filtering, search, pagination, and sorting
 * @param {object} params - Query parameters (status, leagueId, search, page, limit, sort_by, sort_order)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
/**
 * Start a new CeBee Voting Cycle (CVC). Previous cycle is marked completed; app shows only the new cycle once it has polls.
 */
/** Admin: active CVC, cycle list, poll counts per cvcId */
export const getVotingCycleOverview = async () => {
  try {
    const response = await apiGet('/polls/voting-cycle', {});
    if (response.success) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: response.message || response.error || 'Failed to load voting cycles',
      data: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to load voting cycles',
      data: null,
    };
  }
};

/**
 * @param {{ name: string, startDate: string|Date, endDate?: string|Date|null, status?: 'current'|'completed' }} payload
 */
export const startNewVotingCycle = async (payload) => {
  try {
    const body = { ...payload };
    if (body.startDate instanceof Date) body.startDate = body.startDate.toISOString();
    if (body.endDate == null || body.endDate === '') {
      delete body.endDate;
    } else if (body.endDate instanceof Date) {
      body.endDate = body.endDate.toISOString();
    }
    const response = await apiPost('/polls/voting-cycle/start', body);
    if (response.success) {
      return { success: true, data: response.data, message: response.message };
    }
    return {
      success: false,
      error: response.error || response.message || 'Failed to create voting cycle',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to create voting cycle',
    };
  }
};

export const getPolls = async (params = {}) => {
  try {
    // Admin panel needs every poll across all CVCs; mobile/community omits `all` and gets one cycle only.
    const response = await apiGet('/polls', { all: 'true', ...params });
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: { polls: [], pagination: {} },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch polls',
      data: { polls: [], pagination: {} },
    };
  }
};

/**
 * Get poll by ID
 * @param {string} pollId - Poll ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getPoll = async (pollId) => {
  try {
    const response = await apiGet(`/polls/${pollId}`);
    
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
      error: error.message || 'Failed to fetch poll',
    };
  }
};

/**
 * Admin: paginated voters for a poll (latest vote per user).
 * @param {string} pollId
 * @param {{ page?: number, limit?: number, sortBy?: 'time'|'match' }} params — page is 1-based
 */
export const getPollVoters = async (pollId, params = {}) => {
  try {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.limit) || 25));
    const sortBy = params.sortBy === 'match' ? 'match' : 'time';
    const response = await apiGet(`/polls/${pollId}/voters`, { page, limit, sortBy });
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    return {
      success: false,
      error: response.error || response.message || 'Failed to load voters',
      data: { voters: [], pagination: { page: 1, limit, total: 0, pages: 1 } },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to load voters',
      data: { voters: [], pagination: { page: 1, limit: 25, total: 0, pages: 1 } },
    };
  }
};

/**
 * Create new poll
 * @param {object} pollData - Poll data (leagueId, startTime, closeTime, fixtures)
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const createPoll = async (pollData) => {
  try {
    // Validate required fields
    if (!pollData.leagueId || !pollData.leagueId.trim()) {
      console.error('Poll creation failed: leagueId is missing or empty', pollData);
      return {
        success: false,
        error: 'League ID is required',
      };
    }

    if (!pollData.startTime || !pollData.closeTime) {
      return {
        success: false,
        error: 'Start time and close time are required',
      };
    }

    if (!pollData.fixtures || !Array.isArray(pollData.fixtures) || pollData.fixtures.length === 0) {
      return {
        success: false,
        error: 'At least one fixture is required',
      };
    }
    if (
      pollData.fixtures.length < POLL_FIXTURES_MIN ||
      pollData.fixtures.length > POLL_FIXTURES_MAX
    ) {
      return {
        success: false,
        error: `Between ${POLL_FIXTURES_MIN} and ${POLL_FIXTURES_MAX} fixtures are required`,
      };
    }

    // Format the request body to match backend expectations
    // Backend expects camelCase: leagueId, startTime, closeTime, fixtures
    // Backend no longer requires title, description, or community_voting
    const requestBody = {
      leagueId: pollData.leagueId,
      startTime: pollData.startTime instanceof Date 
        ? pollData.startTime.toISOString() 
        : pollData.startTime,
      closeTime: pollData.closeTime instanceof Date 
        ? pollData.closeTime.toISOString() 
        : pollData.closeTime,
      fixtures: pollData.fixtures.map(fixture => ({
        matchNum: fixture.matchNum,
        teamAId: fixture.teamAId,
        teamBId: fixture.teamBId,
      })),
    };

    console.log('Creating poll - pollData received:', pollData);
    console.log('Creating poll - requestBody being sent:', requestBody);
    
    // Validate leagueId is present
    if (!requestBody.leagueId) {
      console.error('ERROR: leagueId is missing in requestBody!', requestBody);
      return {
        success: false,
        error: 'League ID is required',
      };
    }
    const response = await apiPost('/polls', requestBody);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Poll created successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to create poll',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while creating poll',
    };
  }
};

/**
 * Update poll
 * @param {string} pollId - Poll ID
 * @param {object} pollData - Updated poll data
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const updatePoll = async (pollId, pollData) => {
  try {
    if (!pollId) {
      return {
        success: false,
        error: 'Poll ID is required',
      };
    }

    // Format the request body to match backend expectations
    // Backend expects camelCase: leagueId, startTime, closeTime, fixtures
    // Backend no longer requires title, description, or community_voting
    const requestBody = {};
    
    if (pollData.leagueId) {
      requestBody.leagueId = pollData.leagueId;
    }
    
    if (pollData.startTime) {
      requestBody.startTime = pollData.startTime instanceof Date 
        ? pollData.startTime.toISOString() 
        : pollData.startTime;
    }
    
    if (pollData.closeTime) {
      requestBody.closeTime = pollData.closeTime instanceof Date 
        ? pollData.closeTime.toISOString() 
        : pollData.closeTime;
    }
    
    if (pollData.fixtures && Array.isArray(pollData.fixtures)) {
      requestBody.fixtures = pollData.fixtures.map(fixture => ({
        matchNum: fixture.matchNum,
        teamAId: fixture.teamAId,
        teamBId: fixture.teamBId,
      }));
    }

    console.log('Updating poll - pollData received:', pollData);
    console.log('Updating poll - requestBody being sent:', requestBody);
    const response = await apiPut(`/polls/${pollId}`, requestBody);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Poll updated successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to update poll',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while updating poll',
    };
  }
};

/**
 * Get upcoming fixtures from Football API for a league/season (for poll creation). Supports pagination.
 * @param {string} leagueId - League ID (CeBee DB _id or Football API league id)
 * @param {number|string} season - Season year (e.g. 2025)
 * @param {object} options - Optional { page: 1, limit: 20, source: 'db'|'api' } (default source=db = synced fixtures)
 * @returns {Promise<{success: boolean, data?: { fixtures: Array, pagination?: object }, error?: string}>}
 */
export const getUpcomingFixtures = async (leagueId, season, options = {}) => {
  try {
    if (!leagueId || season == null) {
      return {
        success: false,
        error: 'League and season are required',
        data: { fixtures: [], pagination: {} },
      };
    }
    const params = {
      leagueId,
      season: String(season),
      source: options.source || 'db',
      ...(options.page != null && { page: options.page }),
      ...(options.limit != null && { limit: options.limit }),
    };
    const response = await apiGet('/polls/upcoming-fixtures', params);
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          fixtures: response.data.fixtures || [],
          pagination: response.data.pagination || {},
        },
      };
    }
    return {
      success: false,
      error: response.error || 'Failed to load upcoming fixtures',
      data: { fixtures: response.data?.fixtures || [], pagination: response.data?.pagination || {} },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch upcoming fixtures',
      data: { fixtures: [], pagination: {} },
    };
  }
};

/**
 * Create poll from 2–8 Football API fixture IDs (league → select fixtures → create).
 * @param {object} params - { leagueId, season, apiFixtureIds: number[], featuredTeamSides?: string[], startTime, closeTime, status? }
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const createPollFromApi = async (params) => {
  try {
    const { leagueId, season, apiFixtureIds, featuredTeamSides, startTime, closeTime, status } = params;
    const cleanedIds = Array.isArray(apiFixtureIds)
      ? apiFixtureIds.map((id) => parseInt(String(id).trim(), 10)).filter((n) => !Number.isNaN(n))
      : [];
    if (!leagueId || season == null || cleanedIds.length < POLL_FIXTURES_MIN || cleanedIds.length > POLL_FIXTURES_MAX) {
      return {
        success: false,
        error: `leagueId, season, and between ${POLL_FIXTURES_MIN} and ${POLL_FIXTURES_MAX} apiFixtureIds are required`,
      };
    }
    const body = {
      leagueId,
      season: typeof season === 'number' ? season : parseInt(String(season), 10),
      apiFixtureIds: cleanedIds,
      startTime: startTime instanceof Date ? startTime.toISOString() : startTime,
      closeTime: closeTime instanceof Date ? closeTime.toISOString() : closeTime,
    };
    if (Array.isArray(featuredTeamSides) && featuredTeamSides.length === cleanedIds.length) {
      body.featuredTeamSides = featuredTeamSides.map((s) => (s === 'B' ? 'B' : 'A'));
    }
    if (status) body.status = status;
    const response = await apiPost('/polls/from-api', body);
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Poll created from API fixtures',
      };
    }
    return {
      success: false,
      error: response.error || response.message || 'Failed to create poll from API',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Close poll manually
 * @param {string} pollId - Poll ID
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const closePoll = async (pollId) => {
  try {
    if (!pollId) {
      return {
        success: false,
        error: 'Poll ID is required',
      };
    }

    const response = await apiPatch(`/polls/${pollId}/close`, {});
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Poll closed successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to close poll',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while closing poll',
    };
  }
};
