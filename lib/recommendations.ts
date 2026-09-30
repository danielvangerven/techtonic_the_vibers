// Owner: B (Backend + AI). Product recommendations and peer alternatives per moment.
// Products are only recommended for real gaps: anything the customer already holds or has just
// activated is left out, and the next product moves up.
import { daysBetween, todayIso } from "./detect/dates";
import type {
  AdviceItem,
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
  const openAlternatives = alternatives.filter((a) => !holds(a.action?.target));
  return {
    bestProduct: open[0],
    secondaryProduct: open[1],
    alternatives: openAlternatives,
    advice: computeAdvice(customer, moment, peers, open[1], openAlternatives),
  };
}

const round10 = (n: number) => Math.max(10, Math.round(n / 10) * 10);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const shortDate = (iso: string) => `${+iso.slice(8, 10)} ${MONTHS[+iso.slice(5, 7) - 1]}`;

/**
 * Advice that thinks along with the customer: how much to put aside and by when (from what peers
 * really spent), a buffer for surprises, and cheaper alternatives. Short titles; the why is in `detail`.
 */
function computeAdvice(
  customer: Customer,
  moment: Moment,
  peers: PeerStats,
  secondary: KbcProductRecommendation | undefined,
  alternatives: SmartAlternative[],
): AdviceItem[] {
  const advice: AdviceItem[] = [];
  const days = daysBetween(todayIso(), moment.startDate);
  const saved = customer.products.kbc_savings_jar || customer.products.gift_pool;

  // What the customer already paid for this moment (from the payments we linked to it).
  const paid = moment.sources
    .filter((s) => s.kind === "transaction")
    .reduce((sum, s) => sum + Number(/\(€([\d,]+)\)/.exec(s.label)?.[1].replace(/,/g, "") ?? 0), 0);

  if (peers.ok && moment.type === "trip_abroad" && paid > 0) {
    const left = peers.median - paid;
    advice.push(
      left <= 0
        ? {
            id: "spent_already",
            title: `You've already spent €${paid.toLocaleString("en-GB")}, more than most`,
            detail: `People like you spent €${peers.median} in total on a trip like this. Keep an eye on daily spending once you're there.`,
          }
        : {
            id: "left_to_budget",
            title: `Budget about €${round10(left).toLocaleString("en-GB")} more for the trip itself`,
            detail: `You've paid €${paid.toLocaleString("en-GB")} so far. People like you spent €${peers.median} in total.`,
            action: { label: "Set budget", target: "kbc_savings_jar" },
          },
    );
  } else if (peers.ok && moment.type === "moving") {
    advice.push({
      id: "moving_reserve",
      title: `Keep €${peers.median.toLocaleString("en-GB")} ready for the first 3 months`,
      detail: `That's what people like you spent extra after moving: furniture, repairs, double rent or fees. Most spent between €${peers.p20} and €${peers.p80}.`,
      action: { label: "Set aside", target: "kbc_savings_jar" },
    });
  } else if (peers.ok && !saved && moment.type === "trip_abroad") {
    const what = "on a trip like this";
    if (days >= 35) {
      const weeks = Math.floor(days / 7);
      advice.push({
        id: "save_weekly",
        title: `Put aside €${round10(peers.median / weeks)} a week until ${shortDate(moment.startDate)}`,
        detail: `People like you spent €${peers.median} ${what} (most between €${peers.p20} and €${peers.p80}). Spread over ${weeks} weeks, it won't feel like a big hit.`,
        action: { label: "Start saving", target: "kbc_savings_jar" },
      });
    } else {
      advice.push({
        id: "budget",
        title: `Plan for about €${peers.median}`,
        detail: `That's what people like you spent ${what}. Most spent between €${peers.p20} and €${peers.p80}.`,
        action: { label: "Set budget", target: "kbc_savings_jar" },
      });
    }
  }

  if (peers.ok && peers.unexpectedMedian) {
    advice.push({
      id: "buffer",
      title: `Keep €${peers.unexpectedMedian} extra for surprises`,
      detail: `People like you typically ran into about €${peers.unexpectedMedian} of unexpected costs: taxis, a doctor, a lost bag.`,
    });
  }

  if (moment.type === "moving" && moment.attrs.housing === "buy") {
    advice.push({
      id: "insure_before_keys",
      title: "Insure the house from the day you sign",
      detail: "Fire insurance is required by your mortgage and must start on the day of the deed, not the day you move in.",
    });
  }

  if (secondary) {
    advice.push({
      id: secondary.productId,
      title: secondary.name.replace(/\s*\(.*\)\s*/, "").replace(/^Kate Deals: /, ""),
      detail: secondary.reason,
      action: { label: "Add", target: secondary.productId },
    });
  }

  // An "instead" alternative makes no sense once the trip is paid for.
  for (const alt of alternatives.filter((a) => !(paid > 0 && /instead/i.test(a.title)))) {
    advice.push({ id: alt.id, title: alt.title, detail: alt.description, savings: alt.estimatedSavings, action: alt.action });
  }
  return advice.slice(0, 4);
}
