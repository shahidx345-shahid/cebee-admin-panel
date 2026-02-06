/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */

import { apiGet } from './apiBase';

/**
 * Get dashboard statistics
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getDashboardStats = async () => {
  try {
    const response = await apiGet('/admin/dashboard/stats');
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: {
        totalUsers: 0,
        activeUsers: 0,
        totalSPIssued: 0,
        estimatedRewardsValue: 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch dashboard statistics',
      data: {
        totalUsers: 0,
        activeUsers: 0,
        totalSPIssued: 0,
        estimatedRewardsValue: 0,
      },
    };
  }
};

/**
 * Get today's fixture summary
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getTodayFixtureSummary = async () => {
  try {
    const response = await apiGet('/admin/dashboard/fixtures/today');
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: {
        totalMatches: 0,
        completedMatches: 0,
        liveMatches: 0,
        pendingResults: 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch today\'s fixture summary',
      data: {
        totalMatches: 0,
        completedMatches: 0,
        liveMatches: 0,
        pendingResults: 0,
      },
    };
  }
};

/**
 * Get next upcoming fixture
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getNextFixture = async () => {
  try {
    const response = await apiGet('/admin/dashboard/fixtures/next');
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch next fixture',
      data: null,
    };
  }
};

/**
 * Get high-risk admin action alerts
 * @param {object} params - Query parameters (limit, severity)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getHighRiskAlerts = async (params = {}) => {
  try {
    const defaultParams = {
      limit: 5,
      severity: 'critical',
      ...params,
    };
    
    const response = await apiGet('/admin/dashboard/alerts', defaultParams);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: {
        alerts: [],
        total: 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch high-risk alerts',
      data: {
        alerts: [],
        total: 0,
      },
    };
  }
};

/**
 * Get comprehensive dashboard data (all in one call)
 * Backend returns main data in /admin/dashboard, alerts in /admin/dashboard/alerts
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getDashboardData = async () => {
  try {
    // Fetch dashboard data and alerts in parallel
    const [dashboardResponse, alertsResponse] = await Promise.all([
      apiGet('/admin/dashboard'),
      getHighRiskAlerts({ limit: 3 }),
    ]);
    
    if (dashboardResponse.success && dashboardResponse.data) {
      const backendData = dashboardResponse.data;
      
      // Map backend response structure to frontend format
      // Backend returns: { success: true, data: { stats: { ... } } }
      const stats = backendData.stats || {};
      const todayMatches = stats.todayMatches || {};
      
      // Get alerts from separate endpoint or from main response
      let alerts = [];
      if (alertsResponse.success) {
        // Alerts endpoint might return { alerts: [...] } or just [...]
        if (Array.isArray(alertsResponse.data)) {
          alerts = alertsResponse.data;
        } else if (alertsResponse.data?.alerts && Array.isArray(alertsResponse.data.alerts)) {
          alerts = alertsResponse.data.alerts;
        } else if (alertsResponse.data?.data && Array.isArray(alertsResponse.data.data)) {
          alerts = alertsResponse.data.data;
        }
      } else if (backendData.alerts && Array.isArray(backendData.alerts)) {
        // Fallback to alerts in main dashboard response
        alerts = backendData.alerts;
      }
      
      // Debug logging
      console.log('Dashboard API Response:', {
        backendData,
        stats,
        todayMatches,
        alertsResponse,
      });
      
      const mappedData = {
        stats: {
          totalUsers: stats.totalUsers || 0,
          activeUsers: stats.activeUsers || 0,
          totalSPIssued: stats.totalSPIssued || 0,
          estimatedRewardsValue: stats.estimatedRewardsValue || 0,
        },
        todaySummary: {
          totalMatches: todayMatches.total || 0,
          completedMatches: todayMatches.completed || 0,
          liveMatches: todayMatches.live || 0,
          pendingResults: todayMatches.pendingResults || 0,
        },
        nextFixture: backendData.nextFixture || null,
        alerts: Array.isArray(alerts) ? alerts : [],
      };
      
      console.log('Mapped Dashboard Data:', mappedData);
      
      return {
        success: true,
        data: mappedData,
      };
    }
    
    // If response failed, return defaults
    return {
      success: false,
      error: dashboardResponse.error || 'Failed to fetch dashboard data',
      data: {
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          totalSPIssued: 0,
          estimatedRewardsValue: 0,
        },
        todaySummary: {
          totalMatches: 0,
          completedMatches: 0,
          liveMatches: 0,
          pendingResults: 0,
        },
        nextFixture: null,
        alerts: [],
      },
    };
  } catch (error) {
    console.error('Dashboard service error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch dashboard data',
      data: {
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          totalSPIssued: 0,
          estimatedRewardsValue: 0,
        },
        todaySummary: {
          totalMatches: 0,
          completedMatches: 0,
          liveMatches: 0,
          pendingResults: 0,
        },
        nextFixture: null,
        alerts: [],
      },
    };
  }
};
