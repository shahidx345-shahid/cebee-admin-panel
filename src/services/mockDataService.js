


// Static initial data
const initialRewards = [
    {
        id: '1',
        rank: 1,
        username: 'ChiefPredictor',
        userEmail: 'chief@example.com',
        spTotal: 2850,
        usdAmount: 500,
        payoutMethod: 'USDT',
        kycVerified: true,
        kycStatus: 'verified',
        status: 'processing',
        rewardMonth: '2025-09',
        risk: false,
        claimDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        claimSubmittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        kycSubmittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        kycVerifiedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        kycVerifiedBy: 'Admin_001',
        riskLevel: 'none',
        consentOptIn: true,
        consentTimestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        adminNotes: 'User is a consistent top performer.',
        events: [
            { id: 1, action: 'Reward Generated', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), triggeredBy: 'System' },
            { id: 2, action: 'User Claimed Reward', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), triggeredBy: 'User' },
            { id: 3, action: 'KYC Verified', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), triggeredBy: 'Admin_001' }
        ]
    },
    {
        id: '2',
        rank: 2,
        username: 'KingOfPredictions',
        userEmail: 'king@example.com',
        spTotal: 2780,
        usdAmount: 300,
        payoutMethod: 'Gift Card',
        kycVerified: false,
        kycStatus: 'under_review',
        status: 'pending',
        rewardMonth: '2025-09',
        risk: false,
        consentOptIn: false,
        adminNotes: '',
        events: []
    },
    {
        id: '3',
        rank: 3,
        username: 'AfricanLegend',
        userEmail: 'legend@example.com',
        spTotal: 2650,
        usdAmount: 150,
        payoutMethod: 'USDT',
        kycVerified: false,
        kycStatus: 'under_review',
        status: 'pending',
        rewardMonth: '2025-09',
        risk: false,
        consentOptIn: true,
        adminNotes: '',
        events: []
    },
    {
        id: '4',
        rank: 4,
        username: 'GhostUser',
        userEmail: 'ghost@example.com',
        spTotal: 2500,
        usdAmount: 100,
        payoutMethod: 'USDT',
        kycVerified: false,
        kycStatus: 'not_submitted',
        status: 'unclaimed',
        rewardMonth: '2025-09',
        risk: false,
        consentOptIn: false,
        adminNotes: '',
        events: []
    },
    {
        id: '5',
        rank: 5,
        username: 'RiskyPlayer',
        userEmail: 'risk@example.com',
        spTotal: 2400,
        usdAmount: 80,
        payoutMethod: 'USDT',
        kycVerified: false,
        kycStatus: 'rejected',
        status: 'pending',
        risk: true,
        rewardMonth: '2025-09',
        riskLevel: 'high',
        consentOptIn: true,
        adminNotes: 'Suspicious betting patterns detected.',
        events: []
    },
];

// In-memory store
let rewardsStore = [...initialRewards];
let userKycStore = {
    // Stores KYC data per user ID (using simplistic mapping for now)
    '1': { status: 'verified', submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(), verifiedAt: new Date(Date.now() - 4 * 86400000).toISOString(), verifiedBy: 'Admin_001', riskLevel: 'none', notes: 'All documents clear.' },
    'user-123': { status: 'pending', submittedAt: new Date().toISOString(), riskLevel: 'medium', notes: 'Check IP address.' }
};

export const MockDataService = {
    // Rewards
    getRewards: async () => {
        return [...rewardsStore];
    },

    getRewardById: async (id) => {
        return rewardsStore.find(r => r.id === id);
    },

    updateReward: async (id, updates) => {
        const index = rewardsStore.findIndex(r => r.id === id);
        if (index !== -1) {
            rewardsStore[index] = { ...rewardsStore[index], ...updates };
            return rewardsStore[index];
        }
        return null;
    },

    addRewardEvent: async (id, event) => {
        const reward = rewardsStore.find(r => r.id === id);
        if (reward) {
            const events = reward.events || [];
            const newEvents = [event, ...events];
            reward.events = newEvents;
            return reward;
        }
        return null;
    },

    // KYC
    getKycData: async (userId) => {
        return userKycStore[userId] || { status: 'not_submitted', riskLevel: 'none', notes: '' };
    },

    updateKycData: async (userId, data) => {
        userKycStore[userId] = { ...(userKycStore[userId] || {}), ...data };
        return userKycStore[userId];
    }
};
