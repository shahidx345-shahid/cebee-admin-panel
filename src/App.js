import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { constants } from './config/theme';
import MainLayout from './components/layout/MainLayout';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const FixturesPage = lazy(() => import('./pages/FixturesPage'));
const LeaguesPage = lazy(() => import('./pages/LeaguesPage'));
const TeamsPage = lazy(() => import('./pages/TeamsPage'));
const TeamHistoryPage = lazy(() => import('./pages/TeamHistoryPage'));
const PlayersPage = lazy(() => import('./pages/PlayersPage'));
const PredictionsPage = lazy(() => import('./pages/PredictionsPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const RewardsPage = lazy(() => import('./pages/RewardsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const PollsPage = lazy(() => import('./pages/PollsPage'));
const ReferralsPage = lazy(() => import('./pages/ReferralsPage'));
const SystemLogsPage = lazy(() => import('./pages/SystemLogsPage'));
const ContentUpdatesPage = lazy(() => import('./pages/ContentUpdatesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const UserDetailsPage = lazy(() => import('./pages/UserDetailsPage'));
const FixtureDetailsPage = lazy(() => import('./pages/FixtureDetailsPage'));
const FixtureFormPage = lazy(() => import('./pages/FixtureFormPage'));
const LeagueFormPage = lazy(() => import('./pages/LeagueFormPage'));
const RewardFormPage = lazy(() => import('./pages/RewardFormPage'));
const NotificationFormPage = lazy(() => import('./pages/NotificationFormPage'));
const PollFormPage = lazy(() => import('./pages/PollFormPage'));
const FaqFormPage = lazy(() => import('./pages/FaqFormPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));
const PredictionDetailsPage = lazy(() => import('./pages/PredictionDetailsPage'));
const LeaderboardDetailsPage = lazy(() => import('./pages/LeaderboardDetailsPage'));
const RewardDetailsPage = lazy(() => import('./pages/RewardDetailsPage'));

const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }}>
    <div>Loading...</div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return isAuthenticated ? children : <Navigate to={constants.routes.login} />;
};

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path={constants.routes.login}
          element={isAuthenticated ? <Navigate to={constants.routes.dashboard} /> : <LoginPage />}
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path={constants.routes.dashboard} element={<DashboardPage />} />
                  <Route path={constants.routes.users} element={<UsersPage />} />
                  <Route path={constants.routes.usersDetails} element={<UserDetailsPage />} />
                  <Route path={constants.routes.fixtures} element={<FixturesPage />} />
                  <Route path={constants.routes.fixturesAdd} element={<FixtureFormPage />} />
                  <Route path={constants.routes.fixturesEdit} element={<FixtureFormPage />} />
                  <Route path={constants.routes.fixturesDetails} element={<FixtureDetailsPage />} />
                  <Route path={constants.routes.leagues} element={<LeaguesPage />} />
                  <Route path={constants.routes.leaguesAdd} element={<LeagueFormPage />} />
                  <Route path={constants.routes.leaguesEdit} element={<LeagueFormPage />} />
                  <Route path={constants.routes.teams} element={<TeamsPage />} />
                  <Route path={constants.routes.teamsHistory} element={<TeamHistoryPage />} />
                  <Route path={constants.routes.teamsPlayers} element={<PlayersPage />} />
                  <Route path={constants.routes.predictions} element={<PredictionsPage />} />
                  <Route path={constants.routes.predictionsDetails} element={<PredictionDetailsPage />} />
                  <Route path={constants.routes.leaderboard} element={<LeaderboardPage />} />
                  <Route path={constants.routes.leaderboardDetails} element={<LeaderboardDetailsPage />} />
                  <Route path={constants.routes.rewards} element={<RewardsPage />} />
                  <Route path={constants.routes.rewardsAdd} element={<RewardFormPage />} />
                  <Route path={constants.routes.rewardsEdit} element={<RewardFormPage />} />
                  <Route path={constants.routes.rewardsDetails} element={<RewardDetailsPage />} />
                  <Route path={constants.routes.notificationsCreate} element={<NotificationFormPage />} />
                  <Route path={constants.routes.notificationsEdit} element={<NotificationFormPage />} />
                  <Route path={constants.routes.notificationsDetails} element={<PlaceholderPage title="Notification Details" />} />
                  <Route path={constants.routes.notifications} element={<NotificationsPage />} />
                  <Route path={constants.routes.content} element={<ContentUpdatesPage />} />
                  <Route path={constants.routes.contentFaqAdd} element={<FaqFormPage />} />
                  <Route path={constants.routes.contentFaqEdit} element={<FaqFormPage />} />
                  <Route path={constants.routes.polls} element={<PollsPage />} />
                  <Route path={constants.routes.pollsAdd} element={<PollFormPage />} />
                  <Route path={constants.routes.pollsEdit} element={<PollFormPage />} />
                  <Route path={constants.routes.referrals} element={<ReferralsPage />} />
                  <Route path={constants.routes.referralsDetails} element={<PlaceholderPage title="Referral Details" />} />
                  <Route path={constants.routes.logs} element={<SystemLogsPage />} />
                  <Route path={constants.routes.settings} element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to={constants.routes.dashboard} />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
