import type { Moment } from "./types";
import type { Persona, Customer } from "./data";

export interface KbcProductRecommendation {
  productId: string;
  name: string;
  category: "insurance" | "banking" | "loans" | "investments" | "deals_mobility";
  reason: string;
  actionLabel: string;
  priceOrRate?: string;
  badge?: string;
}

export interface SmartAlternative {
  id: string;
  title: string;
  badge: string;
  description: string;
  peerAdoptionRate?: string;
  estimatedSavings?: string;
  action?: { label: string; target: string };
}

export interface MomentRecommendations {
  bestProduct?: KbcProductRecommendation;
  secondaryProduct?: KbcProductRecommendation;
  alternatives: SmartAlternative[];
}

export function computeRecommendations(
  customer: Persona | Customer,
  moment: Moment
): MomentRecommendations {
  const country = moment.attrs.country || "";
  const type = moment.type;

  // -------------------------------------------------------------------------
  // 1. TRIPS ABROAD (e.g. Japan, Portugal, UK, Iceland)
  // -------------------------------------------------------------------------
  if (type === "trip_abroad") {
    // JAPAN / ASIA
    if (country === "JP") {
      return {
        bestProduct: {
          productId: "kbc_travel_global",
          name: "KBC Global Travel Assistance (Wereldwijde Reisbijstand)",
          category: "insurance",
          reason: "Medical costs in Japan are high and not covered by standard Belgian mutuelle/health fund.",
          actionLabel: "Activate Global Assistance (€18.50 / trip)",
          priceOrRate: "€18.50 / trip",
          badge: "Top Recommended",
        },
        secondaryProduct: {
          productId: "kbc_multicurrency_jpy",
          name: "KBC Multi-Currency JPY Sub-Wallet",
          category: "banking",
          reason: "Avoid dynamic exchange rate surcharges at ATMs and local ramen bars in Tokyo.",
          actionLabel: "Open Free JPY Wallet",
          priceOrRate: "Free in KBC Mobile",
          badge: "0% FX Markup",
        },
        alternatives: [
          {
            id: "alt_vietnam_travel",
            title": "Explore Vietnam & Thailand Instead",
            badge: "Popular with Peers (-55% Daily Spend)",
            description: "64% of young KBC travelers to Asia picked Vietnam or Thailand. Average daily spend is €45/day (vs. €180/day in Tokyo), with flights starting at €620.",
            peerAdoptionRate: "64% of peer travelers in your age cohort",
            estimatedSavings: "Save ~€850 on 14-day trip",
            action: { label: "View Southeast Asia Flight Deals", target: "kbc_deals_travel" },
          },
          {
            id: "alt_london_short_trip",
            title": "Quick 3-Day London Eurostar Getaway",
            badge: "Low-Cost Short Break",
            description: "Looking for a culture trip without a 14-hour flight? Eurostar from Brussels Midi to London St Pancras is available from €145 roundtrip.",
            peerAdoptionRate: "Top booked weekend destination",
            estimatedSavings: "Save ~€1,200 vs long-haul",
            action: { label: "Book Eurostar in KBC Mobility", target: "kbc_mobility_rail" },
          },
          {
            id: "alt_booking_cashback",
            title": "Book Hotels via Kate Deals (Booking.com)",
            badge: "KBC Deals Cashback",
            description: "Get 4% to 8% direct cash refund on your Tokyo or Kyoto accommodations by activating KBC Deals before reserving.",
            peerAdoptionRate: "88% of KBC travelers use Kate Deals",
            estimatedSavings: "Save €65 on accommodation",
            action: { label: "Activate 8% Booking Cashback", target: "kbc_deals" },
          },
        ],
      };
    }

    // PORTUGAL / EUROPE
    if (country === "PT") {
      return {
        bestProduct: {
          productId: "kbc_travel_europe",
          name: "KBC European Assistance & Flight Delay Protection",
          category: "insurance",
          reason: "Includes automatic instant compensation if your flight to Lisbon is delayed by >2 hours.",
          actionLabel: "Add European Flight Protection (€12)",
          priceOrRate: "€12 / trip",
          badge: "Recommended",
        },
        secondaryProduct: {
          productId: "kbc_deals_ryanair",
          name: "Kate Deals: 5% Cashback on Ryanair & Car Rental",
          category: "deals_mobility",
          reason: "Direct cashback credited to your KBC checking account within 48 hours of booking.",
          actionLabel: "Claim Lisbon Deals",
          badge: "KBC Partner",
        },
        alternatives: [
          {
            id: "alt_algarve_train",
            title": "Combine Lisbon with Algarve via CP Train",
            badge: "Peer Route Tip",
            description: "58% of KBC travelers spend 3 days in Lisbon and take the 2.5h high-speed train to Faro for beaches.",
            peerAdoptionRate: "58% of Belgian travelers in Portugal",
            estimatedSavings: "€35 train vs €120 rental car",
            action: { label: "See Portugal Route Guide", target: "kbc_deals_guide" },
          },
          {
            id: "alt_valencia_spain",
            title": "Valencia (Spain) as Sunny Alternative",
            badge: "Cheaper Flights This Month",
            description: "Flights from Brussels to Valencia are currently 35% cheaper than Lisbon, with average accommodation at €60/night.",
            peerAdoptionRate: "Rising trend in Flanders",
            estimatedSavings: "Save ~€140 on flights",
            action: { label: "Compare with Valencia", target: "kbc_deals_travel" },
          },
        ],
      };
    }

    // UK / LONDON
    if (country === "GB") {
      return {
        bestProduct: {
          productId: "kbc_multicurrency_gbp",
          name: "KBC Multi-Currency GBP Account",
          category: "banking",
          reason: "London is almost 100% cashless. Pay on the Tube and restaurants in GBP without exchange surcharges.",
          actionLabel: "Enable Free GBP Sub-Wallet",
          priceOrRate: "Free in KBC Mobile",
          badge: "Essential for UK",
        },
        alternatives: [
          {
            id: "alt_esim_uk",
            title": "UK Data eSIM via Kate Deals",
            badge: "Roaming Protection",
            description: "Since Brexit, Belgian roaming rates in the UK can be costly. Get a 5GB UK eSIM for €7 via KBC Deals.",
            peerAdoptionRate: "82% of UK travelers activate an eSIM",
            estimatedSavings: "Save €25 on roaming fees",
            action: { label: "Order UK eSIM (€7)", target: "kbc_deals_esim" },
          },
        ],
      };
    }

    // SWITZERLAND
    if (country === "CH") {
      return {
        bestProduct: {
          productId: "kbc_mobility_vignette",
          name: "Swiss Motorway e-Vignette in KBC Mobility",
          category: "deals_mobility",
          reason: "Buy the official Swiss motorway vignette directly linked to your license plate without stopping at the border.",
          actionLabel: "Purchase Swiss e-Vignette (€42)",
          priceOrRate: "€42 official fee",
          badge: "1-Tap Purchase",
        },
        alternatives: [
          {
            id: "alt_swiss_half_fare",
            title": "Swiss Half-Fare Travelcard for Mountain Trains",
            badge: "Peer Tip for Alps",
            description: "74% of families visiting Interlaken & Zermatt save over €180 on cable cars by getting a Swiss Half Fare Card.",
            peerAdoptionRate: "74% of KBC travelers to Switzerland",
            estimatedSavings: "Save ~€180 on family excursions",
            action: { label: "View Swiss Train Pass", target: "kbc_mobility" },
          },
        ],
      };
    }
  }

  // -------------------------------------------------------------------------
  // 2. MOVING HOUSE / REAL ESTATE
  // -------------------------------------------------------------------------
  if (type === "moving") {
    return {
      bestProduct: {
        productId: "kbc_huurwaarborg",
        name: "KBC Huurwaarborg (Digital Blocked Rental Deposit)",
        category: "banking",
        reason: "Legally compliant blocked rental account setup in 2 minutes directly in KBC Mobile with digital landlord signature.",
        actionLabel: "Open Digital Huurwaarborg",
        priceOrRate: "Free setup",
        badge: "Mandatory for Renters",
      },
      secondaryProduct: {
        productId: "kbc_home_insurance",
        name: "KBC Home & Tenant Insurance (Huurdersaansprakelijkheid)",
        category: "insurance",
        reason: "Covers fire, water damage, and tenant liability for your new address starting the day keys are handed over.",
        actionLabel: "Transfer or Start Home Insurance",
        priceOrRate: "From €14 / month",
        badge: "Required by Law",
      },
      alternatives: [
        {
          id: "alt_dockx_van_discount",
          title": "Rent a Removal Van with Dockx (15% Kate Deal)",
          badge: "KBC Deals Partner",
          description: "Instead of hiring an expensive full-service removal company (€800+), rent a self-drive removal van with 15% cashback through KBC Deals.",
          peerAdoptionRate: "71% of young couples moving in Flanders",
          estimatedSavings: "Save ~€450 on moving day",
          action: { label: "Claim 15% Dockx Discount", target: "kbc_deals_dockx" },
        },
        {
          id: "alt_energy_contract_scan",
          title": "Auto-Compare Energy Contracts for New Address",
          badge: "KBC Energy Scanner",
          description: "Moving is the best time to switch energy providers. KBC scans Flemish market rates to lock in the cheapest green electricity contract.",
          peerAdoptionRate: "Average €320/year savings",
          estimatedSavings: "Save ~€320/year on utilities",
          action: { label: "Scan Energy Rates", target: "kbc_energy_scan" },
        },
      ],
    };
  }

  // -------------------------------------------------------------------------
  // 3. WEDDINGS & CELEBRATIONS
  // -------------------------------------------------------------------------
  if (type === "wedding_guest") {
    return {
      bestProduct: {
        productId: "kbc_cadeaupot",
        name: "KBC Cadeaupot (Digital Group Gift Pool)",
        category: "banking",
        reason: "Create a shared digital gift pot. Friends chip in with Payconiq / Bancontact via a single link without messy IBAN messages.",
        actionLabel: "Create Wedding Gift Pot",
        priceOrRate: "Free in KBC Mobile",
        badge: "Popular with Guests",
      },
      alternatives: [
        {
          id: "alt_shared_gift_peer",
          title": "Typical Peer Gift: €100–€140 per Couple",
          badge: "Peer Benchmark",
          description: "Peers in your age group typically contribute €120 for close friends and €75 for colleagues/acquaintances.",
          peerAdoptionRate: "Based on 1,400+ Flemish weddings",
          estimatedSavings: "Budget certainty",
          action: { label: "Set Aside €120 in Savings Jar", target: "kbc_savings_jar" },
        },
        {
          id: "alt_outfit_cashback",
          title": "Wedding Outfit Cashback via Kate Deals",
          badge: "5-10% Cashback",
          description: "Get cashback on wedding guest attire from partner fashion stores in Ghent and Antwerp.",
          peerAdoptionRate: "62% of wedding guests",
          estimatedSavings: "Save €25 on outfit",
          action: { label: "Browse Fashion Deals", target: "kbc_deals_fashion" },
        },
      ],
    };
  }

  // Default fallback
  return {
    bestProduct: {
      productId: "kbc_plus_account",
      name: "KBC Plus Account",
      category: "banking",
      reason: "All-in-one daily banking with contactless payments, Payconiq, and Kate Deals cashback.",
      actionLabel: "Explore KBC Plus Features",
      badge: "Core Account",
    },
    alternatives: [],
  };
}
