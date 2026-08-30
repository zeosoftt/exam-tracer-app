/**
 * Checkout URL'den Shopier ürün ID'sini çıkarır.
 * Örn. https://www.shopier.com/zeosoft/47039117 → "47039117"
 */

export function extractProductIdFromShopierCheckoutUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split('/').filter(Boolean).pop();
    if (!segment) return null;
    return /^\d+$/.test(segment) ? segment : null;
  } catch {
    return null;
  }
}

/**
 * PRO olarak kabul edilecek Shopier productId listesi.
 * Kaynak: SHOPIER_PRO_PRODUCT_ID env + checkout URL son segment (constants/env).
 * Tahmin yok — yapılandırılmış ID yoksa boş dizi.
 */
export function getConfiguredShopierProProductIds(
  checkoutUrl: string,
  envProductId?: string | null,
  envCheckoutUrl?: string | null,
): string[] {
  const ids = new Set<string>();
  const fromEnv = envProductId?.trim();
  if (fromEnv) ids.add(fromEnv);

  const fromCheckout = extractProductIdFromShopierCheckoutUrl(checkoutUrl);
  if (fromCheckout) ids.add(fromCheckout);

  const fromEnvUrl = envCheckoutUrl?.trim();
  if (fromEnvUrl) {
    const id = extractProductIdFromShopierCheckoutUrl(fromEnvUrl);
    if (id) ids.add(id);
  }

  return [...ids];
}
