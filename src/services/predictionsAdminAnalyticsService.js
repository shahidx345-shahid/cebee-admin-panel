/**
 * CeBee Predictions Admin — P1 analytics API (CMD → matches → users → details).
 */

import { apiGet } from './apiBase';

function unwrap(response) {
  if (response.success) {
    return { success: true, data: response.data };
  }
  return { success: false, error: response.error, data: null };
}

export async function getAdminCmdsList(params = {}) {
  const response = await apiGet('/predictions/admin/analytics/cmds', params);
  return unwrap(response);
}

export async function getPredictionsAdminOverview(params = {}) {
  const response = await apiGet('/predictions/admin/analytics/overview', params);
  return unwrap(response);
}

export async function getCmdBreakdown(cmdId) {
  const response = await apiGet(`/predictions/admin/analytics/cmd/${encodeURIComponent(cmdId)}/breakdown`);
  return unwrap(response);
}

export async function getFixtureUsers(fixtureId) {
  const response = await apiGet(`/predictions/admin/analytics/fixture/${encodeURIComponent(fixtureId)}/users`);
  return unwrap(response);
}
