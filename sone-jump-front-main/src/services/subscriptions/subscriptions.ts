import { apiRequest } from "../api";
import type { Plan, PlanKey } from "../plans/plans";

const subscriptions_endpoints = {
  mine: "/api/subscriptions/me",
  checkout: "/api/subscriptions/checkout",
  cancel: "/api/subscriptions/cancel",
  simulate: (paymentId: number) => `/api/subscriptions/payments/${paymentId}/simulate`,
};

export type BillingCycle = "MENSAL" | "ANUAL";
export type SubscriptionStatus = "PENDENTE" | "ATIVA" | "CANCELADA" | "INADIMPLENTE" | "TRIAL";

export type Subscription = {
  id: number | null;
  status: SubscriptionStatus;
  plan: Plan;
  billingCycle: BillingCycle | null;
  currentPeriodEnd: string | null;
};

export type CheckoutResult = {
  subscriptionId: number;
  paymentId: number;
  amountCents: number;
  checkoutUrl: string | null;
  note: string;
};

export function getMySubscription() {
  return apiRequest<Subscription>(subscriptions_endpoints.mine);
}

export function checkout(input: { planKey: Exclude<PlanKey, "FREE">; billingCycle: BillingCycle }) {
  return apiRequest<CheckoutResult>(subscriptions_endpoints.checkout, {
    method: "POST",
    body: input,
  });
}

export function cancelSubscription() {
  return apiRequest<Subscription>(subscriptions_endpoints.cancel, { method: "POST" });
}

/** Dev-only stand-in for a real payment provider's webhook — 404s in production. */
export function simulatePayment(paymentId: number, outcome: "PAGO" | "FALHOU") {
  return apiRequest<void>(subscriptions_endpoints.simulate(paymentId), {
    method: "POST",
    body: { outcome },
  });
}
