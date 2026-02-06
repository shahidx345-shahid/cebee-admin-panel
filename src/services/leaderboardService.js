/**
 * Leaderboard Service
 * Handles all leaderboard-related API calls
 */

import { apiGet } from './apiBase';

/**
 * Get leaderboard entries with filtering, search, pagination, and sorting
 * @param {object} params - Query parameters (cmdId, period, sort, page, limit, search)
 *   - cmdId: CMd ID for monthly filtering
 *   - period: 'allTime' | 'last7days' | 'last30days'
 *   - sort: 'rankHighToLow' | 'rankLowToHigh' | 'pointsHighestFirst' | 'pointsLowestFirst' | 'accuracyHighestFirst' | 'accuracyLowestFirst' | 'usernameAZ' | 'usernameZA'
 *   - page: page number (1-based)
 *   - limit: items per page
 *   - search: search query
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getLeaderboard = async (params = {}) => {
  try {
    // Map frontend period to backend period
    const backendParams = { ...params };
    
    // Convert 'monthly' to use cmdId if available, otherwise use 'last30days'
    if (backendParams.period === 'monthly') {
      // If cmdId is not provided, we'll need to get current CMd or use last30days
      // For now, use last30days as fallback
      if (!backendParams.cmdId) {
        backendParams.period = 'last30days';
      } else {
        // If cmdId is provided, remove period (cmdId takes precedence)
        delete backendParams.period;
      }
    }
    
    // Map frontend sort to backend sort (if provided in old format)
    if (backendParams.sort_by) {
      const sortMap = {
        'rank': backendParams.sort_order === 'asc' ? 'rankLowToHigh' : 'rankHighToLow',
        'spTotal': backendParams.sort_order === 'desc' ? 'pointsHighestFirst' : 'pointsLowestFirst',
        'accuracyRate': backendParams.sort_order === 'desc' ? 'accuracyHighestFirst' : 'accuracyLowestFirst',
        'username': backendParams.sort_order === 'asc' ? 'usernameAZ' : 'usernameZA',
      };
      backendParams.sort = sortMap[backendParams.sort_by] || 'rankHighToLow';
      delete backendParams.sort_by;
      delete backendParams.sort_order;
    }
    
    const response = await apiGet('/leaderboard', backendParams);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: { leaderboard: [], pagination: {}, totalParticipants: 0 },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch leaderboard',
      data: { leaderboard: [], pagination: {}, totalParticipants: 0 },
    };
  }
};

/**
 * Get leaderboard statistics
 * @param {string} period - Period filter ('monthly' | 'allTime' | 'last7days' | 'last30days')
 * @param {string} cmdId - CMd ID for monthly filtering (optional)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getLeaderboardStatistics = async (period = 'monthly', cmdId = null) => {
  try {
    const params = {};
    
    // Map frontend period to backend period
    if (period === 'monthly') {
      if (cmdId) {
        params.cmdId = cmdId;
      } else {
        // Use last30days as fallback for monthly
        params.period = 'last30days';
      }
    } else {
      params.period = period === 'allTime' ? 'allTime' : period;
    }
    
    const response = await apiGet('/leaderboard/stats', params);
    
    if (response.success) {
      // Map backend response to frontend format
      const stats = response.data;
      return {
        success: true,
        data: {
          totalParticipants: stats.totalParticipants?.value || 0,
          topScorer: stats.topScorer?.username || 'N/A',
          averageAccuracy: stats.averageAccuracy?.value || 0,
          totalPoints: stats.totalSPAwarded?.value || 0,
          // Include full stats object for change percentages
          stats: stats,
        },
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: {
        totalParticipants: 0,
        topScorer: 'N/A',
        averageAccuracy: 0,
        totalPoints: 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch leaderboard statistics',
      data: {
        totalParticipants: 0,
        topScorer: 'N/A',
        averageAccuracy: 0,
        totalPoints: 0,
      },
    };
  }
};

/**
 * Get leaderboard entry details for a specific user
 * @param {string} userId - User ID
 * @param {object} params - Query parameters (period, cmdId)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getLeaderboardEntry = async (userId, params = {}) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    // Backend endpoint is /leaderboard/user/:userId
    const response = await apiGet(`/leaderboard/user/${userId}`, params);
    
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
      error: error.message || 'Failed to fetch leaderboard entry',
    };
  }
};
