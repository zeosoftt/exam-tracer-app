export const MARKETING_EVENTS = [
  'landing_view',
  'cta_click',
  'onboarding_step',
  'onboarding_complete',
  'sign_up',
  'setup_wizard_step',
  'setup_wizard_complete',
  'premium_wall_view',
  'begin_checkout',
  'purchase',
] as const;

export type MarketingEventName = (typeof MARKETING_EVENTS)[number];

export type MarketingEventParams = {
  touchpoint?: string;
  step?: number;
  exam_code?: string;
  exam_track?: string;
  user_type?: string;
  plan_code?: string;
  progress_preset?: string;
  sample_deneme?: boolean;
  checkout_provider?: string;
};

export function isMarketingEventName(value: string): value is MarketingEventName {
  return (MARKETING_EVENTS as readonly string[]).includes(value);
}
