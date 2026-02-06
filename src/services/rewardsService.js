/**
 * Rewards Service
 * Handles all reward-related API calls
 */

import { apiGet, apiPost, apiPut, apiPatch } from './apiBase';

/**
 * Get all rewards with filtering, search, sorting, and pagination
 * @param {object} params - Query parameters (page, limit, search, status, rank, month, consent, sort)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getRewards = async (params = {}) => {
  try {
    // Map frontend parameters to backend format if needed
    const backendParams = { ...params };
    
    // Convert page from 0-based (frontend) to 1-based (backend) if needed
    if (backendParams.page !== undefined) {
      backendParams.page = backendParams.page + 1;
    }
    
    const response = await apiGet('/rewards', backendParams);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: response.error,
      data: { rewards: [], pagination: {} },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch rewards',
      data: { rewards: [], pagination: {} },
    };
  }
};

/**
 * Get reward by ID
 * @param {string} rewardId - Reward ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getRewardById = async (rewardId) => {
  try {
    if (!rewardId) {
      return {
        success: false,
        error: 'Reward ID is required',
      };
    }

    const response = await apiGet(`/rewards/${rewardId}`);
    
    if (response.success) {
      // Backend returns { success: true, data: { reward } }
      // Extract the reward object from the nested structure
      const rewardData = response.data?.reward || response.data;
      return {
        success: true,
        data: rewardData,
      };
    }
    
    return {
      success: false,
      error: response.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch reward details',
    };
  }
};

/**
 * Update reward status
 * @param {string} rewardId - Reward ID
 * @param {string} status - New status (pending, processing, paid, cancelled, declined, unclaimed)
 * @param {string} declineReason - Optional reason for decline/cancel
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const updateRewardStatus = async (rewardId, status, declineReason = null) => {
  try {
    if (!rewardId) {
      return {
        success: false,
        error: 'Reward ID is required',
      };
    }

    if (!status) {
      return {
        success: false,
        error: 'Status is required',
      };
    }

    const updateData = { status };
    if (declineReason) {
      updateData.declineReason = declineReason;
    }

    const response = await apiPatch(`/rewards/${rewardId}/status`, updateData);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Reward status updated successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to update reward status',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while updating reward status',
    };
  }
};

/**
 * Mark reward as fulfilled
 * @param {string} rewardId - Reward ID
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const markRewardAsFulfilled = async (rewardId) => {
  return await updateRewardStatus(rewardId, 'fulfilled');
};

/**
 * Create a gift card reward
 * @param {object} rewardData - Reward data (userId, rank, month, usdAmount, giftCardPlatform, giftCardRegion, etc.)
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const createGiftCardReward = async (rewardData) => {
  try {
    const rewardPayload = {
      ...rewardData,
      rewardType: 'Gift Card',
      payoutMethod: 'Gift Card', // For backward compatibility
    };

    const response = await apiPost('/rewards', rewardPayload);
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Gift card reward created successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to create gift card reward',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while creating gift card reward',
    };
  }
};

/**
 * Cancel or decline reward
 * @param {string} rewardId - Reward ID
 * @param {string} reason - Reason for cancellation/decline
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const cancelReward = async (rewardId, reason) => {
  return await updateRewardStatus(rewardId, 'cancelled', reason);
};

/**
 * Update admin notes for a reward
 * @param {string} rewardId - Reward ID
 * @param {string} notes - Admin notes
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
export const updateRewardNotes = async (rewardId, notes) => {
  try {
    if (!rewardId) {
      return {
        success: false,
        error: 'Reward ID is required',
      };
    }

    const response = await apiPatch(`/rewards/${rewardId}/notes`, { adminNotes: notes });
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Notes updated successfully',
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to update notes',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while updating notes',
    };
  }
};

/**
 * Get reward statistics
 * @param {object} params - Query parameters (month, status)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getRewardStatistics = async (params = {}) => {
  try {
    const response = await apiGet('/rewards/statistics', params);
    
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
        currentMonthWinners: 0,
        pendingPayouts: 0,
        processingCount: 0,
        totalPaid: 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch reward statistics',
      data: {
        currentMonthWinners: 0,
        pendingPayouts: 0,
        processingCount: 0,
        totalPaid: 0,
      },
    };
  }
};
