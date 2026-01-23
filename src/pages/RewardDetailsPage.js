import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    Grid,
    Chip,
    IconButton,
    TextField,
    Dialog,
    DialogContent,
    DialogActions,
    Divider,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack,
    Person,
    CheckCircle,
    Cancel,
    Timeline,
    EmojiEvents,
    AccountBalanceWallet,
    VerifiedUser,
    Warning,
    Info,
    CalendarToday,
} from '@mui/icons-material';
import { colors, constants } from '../config/theme';
import { format } from 'date-fns';

import { MockDataService } from '../services/mockDataService';

const RewardDetailsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Initial state matching the mock data structure
    const [reward, setReward] = useState(null);
    const [loading, setLoading] = useState(true);

    const [notes, setNotes] = useState('');
    const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [confirmPaidDialogOpen, setConfirmPaidDialogOpen] = useState(false);

    useEffect(() => {
        loadReward();
    }, [id]);

    const loadReward = async () => {
        setLoading(true);
        try {
            const data = await MockDataService.getRewardById(id);
            if (data) {
                setReward({
                    ...data,
                    // Parse dates that might be strings from MockDataService
                    claimDeadline: new Date(data.claimDeadline),
                    claimSubmittedAt: data.claimSubmittedAt ? new Date(data.claimSubmittedAt) : null,
                    kycSubmittedAt: data.kycSubmittedAt ? new Date(data.kycSubmittedAt) : null,
                    kycVerifiedAt: data.kycVerifiedAt ? new Date(data.kycVerifiedAt) : null,
                    consentTimestamp: data.consentTimestamp ? new Date(data.consentTimestamp) : null,
                    events: (data.events || []).map(e => ({ ...e, timestamp: new Date(e.timestamp) }))
                });
                setNotes(data.adminNotes || '');
            }
        } catch (error) {
            console.error("Failed to load reward", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async () => {
        const newEvent = { id: Date.now(), action: 'Reward Declined', timestamp: new Date(), triggeredBy: 'Admin' };

        // Optimistic update
        const updatedReward = {
            ...reward,
            status: 'cancelled',
            declineReason: declineReason,
            events: [newEvent, ...reward.events]
        };
        setReward(updatedReward);

        // Persist
        await MockDataService.updateReward(id, {
            status: 'cancelled',
            declineReason: declineReason
        });
        await MockDataService.addRewardEvent(id, {
            ...newEvent,
            timestamp: newEvent.timestamp.toISOString()
        });

        setDeclineDialogOpen(false);
    };

    const handleMarkPaid = async () => {
        const newEvent = { id: Date.now(), action: 'Reward Paid', timestamp: new Date(), triggeredBy: 'Admin' };

        // Optimistic update
        const updatedReward = {
            ...reward,
            status: 'paid',
            events: [newEvent, ...reward.events]
        };
        setReward(updatedReward);

        // Persist
        await MockDataService.updateReward(id, { status: 'paid' });
        await MockDataService.addRewardEvent(id, {
            ...newEvent,
            timestamp: newEvent.timestamp.toISOString()
        });

        setConfirmPaidDialogOpen(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return colors.warning;
            case 'processing': return colors.info;
            case 'paid': return colors.success;
            case 'cancelled':
            case 'declined': return colors.error;
            case 'unclaimed': return colors.textSecondary;
            default: return colors.primary;
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'pending': return '#FFF7ED';
            case 'processing': return '#EBF8FF';
            case 'paid': return '#F0FDF4';
            case 'cancelled':
            case 'declined': return '#FEF2F2';
            case 'unclaimed': return '#F3F4F6';
            default: return '#EBF8FF';
        }
    };

    if (loading) {
        return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    }

    if (!reward) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6">Reward not found</Typography>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(constants.routes.rewards)} sx={{ mt: 2 }}>
                    Back to Rewards
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', maxWidth: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(constants.routes.rewards)} sx={{ mr: 2, color: colors.textSecondary }}>
                    Back
                </Button>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Reward #{reward.id}
                        <Chip
                            label={reward.status.toUpperCase()}
                            sx={{
                                fontWeight: 700,
                                backgroundColor: getStatusBg(reward.status),
                                color: getStatusColor(reward.status),
                                borderRadius: '8px'
                            }}
                        />
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        For {reward.username} ({reward.userEmail})
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={8}>
                    {/* Reward Details (Locked) */}
                    <Card sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Reward Details</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Amount (USD)</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.success }}>${reward.usdAmount}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>SP Total</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>{reward.spTotal.toLocaleString()}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Rank</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>#{reward.rank}</Typography>
                            </Grid>
                        </Grid>
                    </Card>

                    {/* Claim Summary */}
                    <Card sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Claim Summary</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Claim Status</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {reward.claimSubmittedAt ? 'Claimed' : (new Date() > reward.claimDeadline ? 'Expired' : 'Not Claimed')}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Claim Deadline</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {format(reward.claimDeadline, 'MMM dd, HH:mm')}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Claim Submitted</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {reward.claimSubmittedAt ? format(reward.claimSubmittedAt, 'MMM dd, HH:mm') : '-'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Window</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>7 Days</Typography>
                            </Grid>
                        </Grid>
                    </Card>

                    {/* KYC Snapshot */}
                    <Card sx={{ p: 3, mb: 3, borderRadius: '16px', backgroundColor: '#F8FAFC' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            KYC Snapshot
                            <VerifiedUser sx={{ fontSize: 20, color: reward.kycStatus === 'verified' ? colors.success : colors.textSecondary }} />
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} md={4}>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Status</Typography>
                                <Chip label={reward.kycStatus.toUpperCase()} size="small" color={reward.kycStatus === 'verified' ? 'success' : 'default'} />
                            </Grid>
                            <Grid item xs={6} md={4}>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Verified By</Typography>
                                <Typography variant="body2">{reward.kycVerifiedBy || '-'}</Typography>
                            </Grid>
                            <Grid item xs={6} md={4}>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Risk Level</Typography>
                                <Chip label={reward.riskLevel.toUpperCase()} size="small" color={reward.riskLevel === 'high' ? 'error' : 'default'} />
                            </Grid>
                        </Grid>
                    </Card>

                    {/* Testimonial Consent */}
                    <Card sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Consent Tracking</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CheckCircle sx={{ color: reward.consentOptIn ? colors.success : colors.textSecondary }} />
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>Video/Testimonial Opt-In</Typography>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    Timestamp: {reward.consentTimestamp ? format(reward.consentTimestamp, 'MMM dd, yyyy HH:mm') : '-'}
                                </Typography>
                            </Box>
                        </Box>
                    </Card>

                    {/* Decline Reason (Visible if Declined) */}
                    {(reward.status === 'cancelled' || reward.status === 'declined') && (
                        <Card sx={{ p: 3, mb: 3, borderRadius: '16px', border: `1px solid ${colors.error}` }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: colors.error }}>Decline Reason</Typography>
                            <Typography variant="body1">{reward.declineReason}</Typography>
                            <Typography variant="caption" sx={{ color: colors.textSecondary, mt: 1, display: 'block' }}>Visible to user</Typography>
                        </Card>
                    )}

                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={4}>
                    {/* Admin Actions */}
                    <Card sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Actions</Typography>
                        {reward.status !== 'paid' && reward.status !== 'cancelled' ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    fullWidth
                                    onClick={() => setConfirmPaidDialogOpen(true)}
                                    sx={{ borderRadius: '12px', fontWeight: 700, py: 1.5 }}
                                >
                                    Mark as Paid
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    fullWidth
                                    onClick={() => setDeclineDialogOpen(true)}
                                    sx={{ borderRadius: '12px', fontWeight: 700, py: 1.5 }}
                                >
                                    Cancel / Decline
                                </Button>
                            </Box>
                        ) : (
                            <Typography variant="body2" sx={{ color: colors.textSecondary, textAlign: 'center' }}>
                                No actions available for this status.
                            </Typography>
                        )}
                    </Card>

                    {/* Internal Notes */}
                    <Card sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Internal Admin Notes</Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Add notes for audit..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={reward.status === 'paid' || reward.status === 'cancelled'}
                            sx={{ mb: 2 }}
                        />
                        <Button variant="contained" size="small" disabled={reward.status === 'paid' || reward.status === 'cancelled'}>Save Notes</Button>
                    </Card>

                    {/* Timeline */}
                    <Card sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Activity Timeline</Typography>
                        <Box>
                            {reward.events.map((event, index) => (
                                <Box key={index} sx={{ display: 'flex', mb: 2, position: 'relative' }}>
                                    <Timeline sx={{ color: colors.textSecondary, fontSize: 20, mr: 1.5 }} />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{event.action}</Typography>
                                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                            {format(event.timestamp, 'MMM dd, HH:mm')} • {event.triggeredBy}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Dialogs */}
            <Dialog open={declineDialogOpen} onClose={() => setDeclineDialogOpen(false)}>
                <DialogContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Decline Reward</Typography>
                    <TextField
                        fullWidth
                        label="Reason (Visible to User)"
                        multiline
                        rows={3}
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeclineDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDecline}>Decline</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmPaidDialogOpen} onClose={() => setConfirmPaidDialogOpen(false)}>
                <DialogContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Confirm Payment</Typography>
                    <Typography>Are you sure you want to mark this reward as PAID? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmPaidDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleMarkPaid}>Confirm Paid</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default RewardDetailsPage;
