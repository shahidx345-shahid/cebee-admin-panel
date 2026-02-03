/**
 * Centralized API Service for CeBee Admin Panel
 * Handles all backend API calls with proper error handling and state management
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  try {
    const session = localStorage.getItem('admin_session');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.token || null;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return null;
};

/**
 * Save authentication token to localStorage
 */
const saveAuthToken = (token, user) => {
  try {
    const session = {
      token,
      user,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('admin_session', JSON.stringify(session));
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
};

/**
 * Remove authentication token from localStorage
 */
const removeAuthToken = () => {
  try {
    localStorage.removeItem('admin_session');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

/**
 * Get stored user session
 */
const getStoredSession = () => {
  try {
    const session = localStorage.getItem('admin_session');
    if (session) {
      return JSON.parse(session);
    }
  } catch (error) {
    console.error('Error getting stored session:', error);
  }
  return null;
};

/**
 * Main API request function with error handling
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    let data;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle unauthorized - clear session and redirect to login
    if (response.status === 401) {
      removeAuthToken();
      // Don't redirect here - let the component handle it
      throw new Error('Unauthorized. Please login again.');
    }

    // Handle other errors
    if (!response.ok) {
      const errorMessage = data?.message || data?.error?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
      response,
    };
  } catch (error) {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and ensure the backend server is running.');
    }

    // Re-throw other errors
    throw error;
  }
};

/**
 * API Service Object with all endpoints
 */
const apiService = {
  // ============================================
  // Authentication Endpoints
  // ============================================
  
  /**
   * Login admin user
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise<{success: boolean, data: object, message: string}>}
   */
  login: async (email, password) => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Check if user is admin
      if (response.data?.user?.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Save token and user data
      if (response.data.token && response.data.user) {
        saveAuthToken(response.data.token, response.data.user);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || 'Login successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed. Please check your credentials.',
      };
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise<{success: boolean, data: object}>}
   */
  getCurrentUser: async () => {
    try {
      const response = await apiRequest('/auth/me');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Logout (clear session)
   */
  logout: () => {
    removeAuthToken();
    return { success: true };
  },

  // ============================================
  // Player Management Endpoints
  // ============================================

  /**
   * Get all players with filtering
   * @param {object} params - Query parameters (team_id, status, search, page, limit)
   * @returns {Promise<{success: boolean, data: object}>}
   */
  getPlayers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/players${queryString ? `?${queryString}` : ''}`;
      const response = await apiRequest(endpoint);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: { players: [], pagination: {} },
      };
    }
  },

  /**
   * Get players by team
   * @param {string} teamId - Team ID
   * @param {object} params - Additional query parameters
   * @returns {Promise<{success: boolean, data: object}>}
   */
  getPlayersByTeam: async (teamId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/players/team/${teamId}${queryString ? `?${queryString}` : ''}`;
      const response = await apiRequest(endpoint);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: { players: [], team: null },
      };
    }
  },

  /**
   * Get player by ID
   * @param {string} playerId - Player ID
   * @returns {Promise<{success: boolean, data: object}>}
   */
  getPlayer: async (playerId) => {
    try {
      const response = await apiRequest(`/players/${playerId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Create new player
   * @param {object} playerData - Player data (team_id, player_name, position, shirt_number)
   * @returns {Promise<{success: boolean, data: object}>}
   */
  createPlayer: async (playerData) => {
    try {
      const response = await apiRequest('/players', {
        method: 'POST',
        body: JSON.stringify(playerData),
      });
      return {
        success: true,
        data: response.data,
        message: response.message || 'Player created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Update player
   * @param {string} playerId - Player ID
   * @param {object} playerData - Updated player data
   * @returns {Promise<{success: boolean, data: object}>}
   */
  updatePlayer: async (playerId, playerData) => {
    try {
      const response = await apiRequest(`/players/${playerId}`, {
        method: 'PUT',
        body: JSON.stringify(playerData),
      });
      return {
        success: true,
        data: response.data,
        message: response.message || 'Player updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Temporarily deactivate player
   * @param {string} playerId - Player ID
   * @param {object} deactivationData - {inactive_reason, inactive_note?, inactive_until?}
   * @returns {Promise<{success: boolean, data: object}>}
   */
  deactivatePlayerTemporary: async (playerId, deactivationData) => {
    try {
      const response = await apiRequest(`/players/${playerId}/deactivate-temporary`, {
        method: 'PATCH',
        body: JSON.stringify(deactivationData),
      });
      return {
        success: true,
        data: response.data,
        message: response.message || 'Player temporarily deactivated',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Permanently deactivate player
   * @param {string} playerId - Player ID
   * @param {object} deactivationData - {inactive_reason, inactive_note?, confirm: true}
   * @returns {Promise<{success: boolean, data: object}>}
   */
  deactivatePlayerPermanent: async (playerId, deactivationData) => {
    try {
      const response = await apiRequest(`/players/${playerId}/deactivate-permanent`, {
        method: 'PATCH',
        body: JSON.stringify(deactivationData),
      });
      return {
        success: true,
        data: response.data,
        message: response.message || 'Player permanently deactivated',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Reactivate player
   * @param {string} playerId - Player ID
   * @returns {Promise<{success: boolean, data: object}>}
   */
  reactivatePlayer: async (playerId) => {
    try {
      const response = await apiRequest(`/players/${playerId}/reactivate`, {
        method: 'PATCH',
      });
      return {
        success: true,
        data: response.data,
        message: response.message || 'Player reactivated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // ============================================
  // Team Management Endpoints
  // ============================================

  /**
   * Get team by ID
   * @param {string} teamId - Team ID
   * @returns {Promise<{success: boolean, data: object}>}
   */
  getTeam: async (teamId) => {
    try {
      const response = await apiRequest(`/teams/${teamId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // ============================================
  // Utility Functions
  // ============================================

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const session = getStoredSession();
    return !!(session && session.token);
  },

  /**
   * Get stored user data
   * @returns {object|null}
   */
  getStoredUser: () => {
    const session = getStoredSession();
    return session?.user || null;
  },

  /**
   * Get auth token
   * @returns {string|null}
   */
  getToken: () => {
    return getAuthToken();
  },
};

export default apiService;
