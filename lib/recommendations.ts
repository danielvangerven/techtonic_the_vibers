// Owner: B (Backend + AI). Product recommendations and peer alternatives per moment.
// Products are only recommended for real gaps: anything the customer already holds or has just
// activated is left out, and the next product moves up.
import type {
  KbcProductRecommendation,
  Moment,
  MomentRecommendations,
  PeerStats,
  SmartAlternative,
} from "./types";
import type { Customer } from "./data";

type Offer = KbcProductRecommendation & { needsMissing?: string }; // shown only if this flag is missing

const PRODUCTS: Record<string, Offer> = {
  travel_global: {
    productId: "kbc_travel_global",
    name: "KBC Global Travel Assistance (Wereldwijde Reisbijstand)",
    category: "insurance",
    reason: "Medical costs outside Europe are high and not covered by your Belgian health fund.",
    actionLabel: "Activate Global Assistance (€18.50 / trip)",
    priceOrRate: "€18.50 / trip",
    badge: "Top Recommended",
    needsMissing: "travel_medical",
  },
  travel_europe: {
    productId: "kbc_travel_europe",
    name: "KBC European Assistance & Flight Delay Protection",
    category: "insurance",
    reason: "Medical assistance abroad plus automatic compensation if your flight is delayed by more than 2 hours.",
    actionLabel: "Add European Assistance (€12)",
    priceOrRate: "€12 / trip",
    badge: "Recommended",
    needsMissing: "travel_medical",
  },
  jpy_wallet: {
    productId: "kbc_multicurrency_jpy",
    name: "KBC Multi-Currency JPY Sub-Wallet",
    category: "banking",
    reason: "Avoid dynamic exchange-rate surcharges at ATMs and cash-only ramen bars in Japan.",
    actionLabel: "Open Free JPY Wallet",
    priceOrRate: "Free in KBC Mobile",
    badge: "0% FX Markup",
  },
  gbp_wallet: {
    productId: "kbc_multicurrency_gbp",
    name: "KBC Multi-Currency GBP Account",
    category: "banking",
    reason: "London is almost fully cashless. Pay on the Tube and in restaurants in GBP without exchange surcharges.",
    actionLabel: "Enable Free GBP Sub-Wallet",
    priceOrRate: "Free in KBC Mobile",
    badge: "Essential for UK",
  },
  ryanair_deal: {
    productId: "kbc_deals_ryanair",
    name: "Kate Deals: 5% Cashback on Ryanair & Car Rental",
    category: "deals_mobility",
    reason: "Direct cashback credited to your KBC account within 48 hours of booking.",
    actionLabel: "Claim Travel Deals",
    badge: "KBC Partner",
  },
  swiss_vignette: {
    productId: "kbc_mobility_vignette",
    name: "Swiss Motorway e-Vignette in KBC Mobility",
    category: "deals_mobility",
    reason: "Buy the official Swiss motorway vignette linked to your licence plate, without stopping at the border.",
    actionLabel: "Purchase Swiss e-Vignette (€42)",
    priceOrRate: "€42 official fee",
    badge: "1-Tap Purchase",
  },
  huurwaarborg: {
    productId: "kbc_huurwaarborg",
    name: "KBC Huurwaarborg (Digital Blocked Rental Deposit)",
    category: "banking",
    reason: "A legally compliant blocked rental account, set up in 2 minutes in KBC Mobile with a digital landlord signature.",
    actionLabel: "Open Digital Huurwaarborg",
    priceOrRate: "Free setup",
    badge: "For Renters",
  },
  home_insurance: {
    productId: "kbc_home_insurance",
    name: "KBC Home Insurance (Woningverzekering)",
    category: "insurance",
    reason: "Covers fire, water damage and liability at your new address from the day you get the keys.",
    actionLabel: "Start Home Insurance",
    priceOrRate: "From €14 / month",
    badge: "Needed from Day 1",
    needsMissing: "home_insurance",
  },
  cadeaupot: {
    productId: "kbc_cadeaupot",
    name: "KBC Cadeaupot (Digital Group Gift Pool)",
    category: "banking",
    reason: "Create a shared gift pot. Friends chip in with Payconiq or Bancontact via one link, without IBAN messages.",
    actionLabel: "Create Wedding Gift Pot",
    priceOrRate: "Free in KBC Mobile",
    badge: "Popular with Guests",
    needsMissing: "gift_pool",
  },
};

const ALTERNATIVES: Record<string, SmartAlternative> = {
  asia_cheaper: {
    id: "alt_vietnam_travel",
    title: "Explore Vietnam & Thailand Instead",
    badge: "Lower Daily Spend",
    description: "Average daily spend in Vietnam or Thailand is around €45/day (vs. €180/day in Tokyo), with flights from €620.",
    estimatedSavings: "Save ~€850 on a 14-day trip",
    action: { label: "View Southeast Asia Flight Deals", target: "kbc_deals_travel" },
  },
  booking_cashback: {
    id: "alt_booking_cashback",
    title: "Book Hotels via Kate Deals (Booking.com)",
    badge: "KBC Deals Cashback",
    description: "Get 4% to 8% cashback on your accommodation by activating KBC Deals before you book.",
    estimatedSavings: "Save €65 on accommodation",
    action: { label: "Activate 8% Booking Cashback", target: "kbc_deals" },
  },
  eurostar: {
    id: "alt_london_short_trip",
    title: "Take the Eurostar instead of flying",
    badge: "Low-Cost Short Break",
    description: "Eurostar from Brussels-Midi to London St Pancras is available from €145 return, city centre to city centre.",
    action: { label: "Book Eurostar in KBC Mobility", target: "kbc_mobility_rail" },
  },
  uk_esim: {
    id: "alt_esim_uk",
    title: "UK Data eSIM via Kate Deals",
    badge: "Roaming Protection",
    description: "Since Brexit, Belgian roaming in the UK can be costly. Get a 5GB UK eSIM for €7 via KBC Deals.",
    estimatedSavings: "Save €25 on roaming fees",
    action: { label: "Order UK eSIM (€7)", target: "kbc_deals_esim" },
  },
  algarve: {
    id: "alt_algarve_train",
    title: "Combine Lisbon with the Algarve by train",
    badge: "Route Tip",
    description: "Spend 3 days in Lisbon and take the 2.5h train to Faro for the beaches.",
    estimatedSavings: "€35 train vs €120 rental car",
    action: { label: "See Portugal Route Guide", target: "kbc_deals_guide" },
  },
  swiss_half_fare: {
    id: "alt_swiss_half_fare",
    title: "Swiss Half-Fare Travelcard for Mountain Trains",
    badge: "Tip for the Alps",
    description: "Families visiting Interlaken & Zermatt save on cable cars and mountain trains with a Swiss Half Fare Card.",
    estimatedSavings: "Save ~€180 on family excursions",
    action: { label: "View Swiss Train Pass", target: "kbc_mobility" },
  },
  dockx: {
    id: "alt_dockx_van_discount",
    title: "Rent a Removal Van with Dockx (15% Kate Deal)",
    badge: "KBC Deals Partner",
    description: "Instead of a full-service removal company (€800+), rent a self-drive van with 15% cashback through KBC Deals.",
    estimatedSavings: "Save ~€450 on moving day",
    action: { label: "Claim 15% Dockx Discount", target: "kbc_deals_dockx" },
  },
  energy_scan: {
    id: "alt_energy_contract_scan",
    title: "Compare Energy Contracts for your New Address",
    badge: "KBC Energy Scanner",
    description: "Moving is the best time to switch energy provider. KBC compares market rates for your new address.",
    estimatedSavings: "Save ~€320/year on utilities",
    action: { label: "Scan Energy Rates", target: "kbc_energy_scan" },
  },
  outfit_cashback: {
    id: "alt_outfit_cashback",
    title: "Wedding Outfit Cashback via Kate Deals",
    badge: "5-10% Cashback",
    description: "Get cashback on wedding-guest outfits from partner fashion stores in Ghent and Antwerp.",
    estimatedSavings: "Save €25 on an outfit",
    action: { label: "Browse Fashion Deals", target: "kbc_deals_fashion" },
  },
};

const EUROPE = new Set(["PT", "ES", "IT", "FR", "NL", "DE", "AT", "CZ", "GR", "IS", "CH", "GB"]);

/** Offers and alternatives per moment, before filtering out what the customer already holds. */
function candidates(moment: Moment, peers: PeerStats): { offers: Offer[]; alternatives: SmartAlternative[] } {
  const country = moment.attrs.country ?? "";
  switch (moment.type) {
    case "trip_abroad": {
      const cover = EUROPE.has(country) ? PRODUCTS.travel_europe : PRODUCTS.travel_global;
      if (country === "JP") {
        return { offers: [cover, PRODUCTS.jpy_wallet], alternatives: [ALTERNATIVES.asia_cheaper, ALTERNATIVES.booking_cashback] };
      }
      if (country === "GB") {
        return { offers: [cover, PRODUCTS.gbp_wallet], alternatives: [ALTERNATIVES.eurostar, ALTERNATIVES.uk_esim] };
      }
      if (country === "CH") {
        return { offers: [cover, PRODUCTS.swiss_vignette], alternatives: [ALTERNATIVES.swiss_half_fare] };
      }
      if (country === "PT") {
        return { offers: [cover, PRODUCTS.ryanair_deal], alternatives: [ALTERNATIVES.algarve, ALTERNATIVES.booking_cashback] };
      }
      return { offers: [cover, PRODUCTS.ryanair_deal], alternatives: [ALTERNATIVES.booking_cashback] };
    }
    case "moving": {
      if (moment.attrs.housing === "buy") {
        return { offers: [PRODUCTS.home_insurance], alternatives: [ALTERNATIVES.energy_scan] };
      }
      return {
        offers: [PRODUCTS.home_insurance, PRODUCTS.huurwaarborg],
        alternatives: [ALTERNATIVES.dockx, ALTERNATIVES.energy_scan],
      };
    }
    case "wedding_guest": {
      // The gift benchmark comes from the peer engine, so it matches the numbers on screen.
      const gift: SmartAlternative[] = peers.ok
        ? [{
            id: "alt_peer_gift",
            title: `Typical gift from people like you: €${peers.p20}–€${peers.p80}`,
            badge: "Peer Benchmark",
            description: `The middle gift among ${peers.cohortLabel} is €${peers.median}. Set it aside now so it doesn't surprise you.`,
            peerAdoptionRate: `Based on ${peers.n} similar customers`,
            action: { label: `Set Aside €${peers.median} in a Savings Jar`, target: "kbc_savings_jar" },
          }]
        : [];
      return { offers: [PRODUCTS.cadeaupot], alternatives: [...gift, ALTERNATIVES.outfit_cashback] };
    }
  }
}

export function computeRecommendations(customer: Customer, moment: Moment, peers: PeerStats): MomentRecommendations {
  const { offers, alternatives } = candidates(moment, peers);
  const holds = (flag?: string) => !!flag && customer.products[flag] === true;
  const open = offers
    .filter((o) => !holds(o.productId) && !holds(o.needsMissing))
    .map(({ needsMissing: _needsMissing, ...offer }) => offer);
  return {
    bestProduct: open[0],
    secondaryProduct: open[1],
    alternatives: alternatives.filter((a) => !holds(a.action?.target)),
  };
}
