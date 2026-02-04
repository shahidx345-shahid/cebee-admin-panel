/**
 * CMd (CeBee Matchday) Service
 * Handles all CMd-related API calls
 */

import { apiGet, apiPost, apiPatch } from './apiBase';

/**
 * Get all CMds with optional status filter
 * @param {object} params - Query parameters (status: "current" | "completed")
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getCmds = async (params = {}) => {
  try {
    const response = await apiGet('/cmds', params);
    
    if (response.success) {
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : (response.data?.cmds || []),
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch CMds',
      data: [],
    };
  }
};

/**
 * Get current CMd
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getCurrentCmd = async () => {
  try {
    const response = await apiGet('/cmds/current');
    
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
      error: error.message || 'Failed to fetch current CMd',
    };
  }
};

/**
 * Create new CMd
 * @param {object} cmdData - CMd data (name, startDate, endDate, status)
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const createCmd = async (cmdData) => {
  try {
    // Validate required fields
    if (!cmdData.name || !cmdData.name.trim()) {
      return {
        success: false,
        error: 'CMd name is required',
      };
    }

    if (!cmdData.startDate) {
      return {
        success: false,
        error: 'Start date is required',
      };
    }

    if (!cmdData.endDate) {
      return {
        success: false,
        error: 'End date is required',
      };
    }

    // Format the request body
    const requestBody = {
      name: cmdData.name.trim(),
      startDate: cmdData.startDate instanceof Date 
        ? cmdData.startDate.toISOString() 
        : cmdData.startDate,
      endDate: cmdData.endDate instanceof Date 
        ? cmdData.endDate.toISOString() 
        : cmdData.endDate,
    };

    if (cmdData.status) {
      requestBody.status = cmdData.status;
    }

    console.log('Creating CMd - cmdData received:', cmdData);
    console.log('Creating CMd - requestBody being sent:', requestBody);
    
    const response = await apiPost('/cmds', requestBody);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'CMd created successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to create CMd',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while creating CMd',
    };
  }
};

/**
 * Update CMd status
 * @param {string} cmdId - CMd ID
 * @param {string} status - New status ("current" | "completed")
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const updateCmdStatus = async (cmdId, status) => {
  try {
    if (!cmdId) {
      return {
        success: false,
        error: 'CMd ID is required',
      };
    }

    if (!status) {
      return {
        success: false,
        error: 'Status is required',
      };
    }

    const response = await apiPatch(`/cmds/${cmdId}/status`, { status });
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'CMd status updated successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to update CMd status',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while updating CMd status',
    };
  }
};
