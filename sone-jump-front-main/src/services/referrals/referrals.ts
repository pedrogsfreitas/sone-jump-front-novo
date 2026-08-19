import { apiRequest } from "../api";

const referrals_endpoints = {
  mine: "/api/referrals/me",
  claim: "/api/referrals/claim",
};

export type ReferralStats = {
  code: string;
  referralsCount: number;
  conversionsCount: number;
  totalEarningsCents: number;
};

export function getMyReferralStats() {
  return apiRequest<ReferralStats>(referrals_endpoints.mine);
}

export function claimReferral(code: string) {
  return apiRequest<void>(referrals_endpoints.claim, { method: "POST", body: { code } });
}
