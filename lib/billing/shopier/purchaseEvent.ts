/**
 * Internal purchase intent — Shopier-agnostic.
 * Activation services consume this; adapter produces it.
 */

export type PurchaseEvent = {
  provider: 'shopier';
  orderId: string;
  email: string;
  planCode: 'PRO';
};
