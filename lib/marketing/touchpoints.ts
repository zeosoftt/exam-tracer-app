/** Satış hunisi touchpoint kodları — analytics ve checkout attribution. */
export const MARKETING_TOUCHPOINTS = {
  LANDING_HERO: 'landing_hero',
  LANDING_MID_CTA: 'landing_mid_cta',
  LANDING_FINAL_CTA: 'landing_final_cta',
  LANDING_STICKY_CTA: 'landing_sticky_cta',
  LANDING_MOBILE_CTA: 'landing_mobile_cta',
  LANDING_HEADER: 'landing_header',
  LANDING_PRICING: 'landing_pricing',
  DASHBOARD_HEADER: 'dashboard_header',
  DASHBOARD_BANNER: 'dashboard_banner',
  SETTINGS_PLAN: 'settings_plan',
  DENEME_LIST_WALL: 'deneme_list_wall',
  DENEME_DETAIL_WALL: 'deneme_detail_wall',
  SETUP_WIZARD: 'setup_wizard',
} as const;

export type MarketingTouchpoint = (typeof MARKETING_TOUCHPOINTS)[keyof typeof MARKETING_TOUCHPOINTS];

export const MARKETING_TOUCHPOINT_LABELS: Record<MarketingTouchpoint, string> = {
  landing_hero: 'Landing — Hero',
  landing_mid_cta: 'Landing — Orta CTA',
  landing_final_cta: 'Landing — Alt CTA',
  landing_sticky_cta: 'Landing — Yapışkan CTA',
  landing_mobile_cta: 'Landing — Mobil CTA',
  landing_header: 'Landing — Header',
  landing_pricing: 'Landing — Fiyatlandırma',
  dashboard_header: 'Dashboard — Header rozeti',
  dashboard_banner: 'Dashboard — Pro banner',
  settings_plan: 'Ayarlar — Plan',
  deneme_list_wall: 'Deneme — Liste duvarı',
  deneme_detail_wall: 'Deneme — Detay duvarı',
  setup_wizard: 'Kurulum sihirbazı',
};
