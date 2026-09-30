// Owner: B (Backend + AI). Every product or deal a customer can activate from the app, and the
// coverage flag it gives them (the flags the readiness checks look at). IDs not listed here are
// rejected by /api/moments/[id]/resolve.
export const PRODUCTS: Record<string, { name: string; grants?: string }> = {
  // Insurance and cards that close a readiness gap
  travel_medical: { name: "Travel medical cover", grants: "travel_medical" },
  kbc_travel_global: { name: "KBC Global Travel Assistance", grants: "travel_medical" },
  kbc_travel_europe: { name: "KBC European Assistance", grants: "travel_medical" },
  kbc_plus_card: { name: "KBC Plus card with cancellation cover", grants: "cancellation_cover" },
  home_insurance: { name: "KBC Home Insurance", grants: "home_insurance" },
  kbc_home_insurance: { name: "KBC Home Insurance", grants: "home_insurance" },
  kbc_gift_pool: { name: "KBC Gift Pool", grants: "gift_pool" },
  kbc_cadeaupot: { name: "KBC Cadeaupot", grants: "gift_pool" },
  kbc_savings_jar: { name: "KBC Savings Jar", grants: "gift_pool" },
  // Banking and deals
  kbc_multicurrency_jpy: { name: "KBC Multi-Currency JPY wallet" },
  kbc_multicurrency_gbp: { name: "KBC Multi-Currency GBP wallet" },
  kbc_huurwaarborg: { name: "KBC digital rental deposit" },
  kbc_plus_account: { name: "KBC Plus Account" },
  kbc_mobility_vignette: { name: "Swiss e-Vignette in KBC Mobility" },
  kbc_mobility: { name: "KBC Mobility" },
  kbc_mobility_rail: { name: "KBC Mobility rail booking" },
  kbc_deals: { name: "KBC Deals" },
  kbc_deals_travel: { name: "KBC Deals travel" },
  kbc_deals_ryanair: { name: "KBC Deals Ryanair cashback" },
  kbc_deals_guide: { name: "KBC Deals route guide" },
  kbc_deals_esim: { name: "KBC Deals eSIM" },
  kbc_deals_dockx: { name: "KBC Deals Dockx discount" },
  kbc_deals_fashion: { name: "KBC Deals fashion" },
  kbc_energy_scan: { name: "KBC Energy Scanner" },
};

export const PRODUCT_IDS = Object.keys(PRODUCTS) as [string, ...string[]];

/** The product flags a customer holds after activating `productId`. */
export function withProduct(products: Record<string, boolean>, productId: string): Record<string, boolean> {
  const grants = PRODUCTS[productId]?.grants;
  return { ...products, [productId]: true, ...(grants ? { [grants]: true } : {}) };
}
