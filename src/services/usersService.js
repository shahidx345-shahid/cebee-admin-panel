/**
 * Users Service
 * Handles all user-related API calls
 */

import { apiGet, apiPost, apiPut, apiPatch } from './apiBase';

/**
 * Get all users with filtering, search, sorting, and pagination
 * @param {object} params - Query parameters (page, limit, search, status, sort)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getUsers = async (params = {}) => {
  try {
    const response = await apiGet('/users', params);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: { users: [], pagination: {} },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch users',
      data: { users: [], pagination: {} },
    };
  }
};

/**
 * Get user statistics (Admin only)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getUserStatistics = async () => {
  try {
    const response = await apiGet('/users/statistics');
    
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
        verifiedUsers: 0,
        flaggedUsers: 0,
        blockedUsers: 0,
        deactivatedUsers: 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch user statistics',
      data: {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        flaggedUsers: 0,
        blockedUsers: 0,
        deactivatedUsers: 0,
      },
    };
  }
};

/**
 * Get comprehensive user details by ID
 * @param {string} userId - User ID
 * @param {object} params - Additional query parameters (activityLimit)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getUserDetails = async (userId, params = {}) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    const response = await apiGet(`/users/${userId}`, params);
    
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
      error: error.message || 'Failed to fetch user details',
    };
  }
};

/**
 * Block or unblock user
 * @param {string} userId - User ID
 * @param {boolean} isBlocked - Whether to block or unblock
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const blockUser = async (userId, isBlocked) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    const response = await apiPut(`/users/${userId}/block`, { isBlocked });
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || (isBlocked ? 'User blocked successfully' : 'User unblocked successfully'),
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to update user block status',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while updating user block status',
    };
  }
};

/**
 * Suspend or unsuspend user (Admin only)
 * @param {string} userId - User ID
 * @param {boolean} isActive - false to suspend, true to unsuspend
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const suspendUser = async (userId, isActive = false) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    const response = await apiPut(`/users/${userId}/suspend`, { isActive });
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || (isActive ? 'User unsuspended successfully' : 'User suspended successfully'),
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to update user suspend status',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while updating user suspend status',
    };
  }
};

/**
 * Adjust user SP (Admin only)
 * @param {string} userId - User ID
 * @param {number} amount - SP amount
 * @param {string} type - 'add' to add amount, 'set' to set amount
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const adjustUserSP = async (userId, amount, type = 'add') => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    if (type !== 'add' && type !== 'set') {
      return {
        success: false,
        error: 'Type must be either "add" or "set"',
      };
    }

    const response = await apiPut(`/users/${userId}/sp`, { amount, type });
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'SP adjusted successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to adjust user SP',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while adjusting user SP',
    };
  }
};

/**
 * Flag user (Admin only)
 * @param {string} userId - User ID
 * @param {string} flagReason - Reason for flagging
 * @param {array} fraudFlags - Array of fraud flag types (optional)
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const flagUser = async (userId, flagReason, fraudFlags = []) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    if (!flagReason || flagReason.trim() === '') {
      return {
        success: false,
        error: 'Flag reason is required',
      };
    }

    const response = await apiPost(`/users/${userId}/flag`, { flagReason, fraudFlags });
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'User flagged successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to flag user',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while flagging user',
    };
  }
};

/**
 * Request KYC verification for user (Admin only)
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const requestKYC = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    const response = await apiPost(`/users/${userId}/kyc/request`);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'KYC request created successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to request KYC',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while requesting KYC',
    };
  }
};

/**
 * Verify user KYC (Admin only)
 * @param {string} userId - User ID
 * @param {string} riskLevel - Risk level (none, low, medium, high)
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const verifyKYC = async (userId, riskLevel = 'none') => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    const response = await apiPut(`/users/${userId}/kyc/verify`, { riskLevel });
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'KYC verified successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to verify KYC',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while verifying KYC',
    };
  }
};

/**
 * Reject user KYC (Admin only)
 * @param {string} userId - User ID
 * @param {string} reason - Reason for rejection (optional)
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const rejectKYC = async (userId, reason = '') => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    const response = await apiPut(`/users/${userId}/kyc/reject`, { reason });
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'KYC rejected successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to reject KYC',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while rejecting KYC',
    };
  }
};

/**
 * Expire user KYC (Admin only)
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const expireKYC = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    const response = await apiPut(`/users/${userId}/kyc/expire`);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'KYC marked as expired successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to expire KYC',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while expiring KYC',
    };
  }
};
