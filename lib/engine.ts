import type { Moment, MomentView, Check } from "./types";
import { getTemplate, type Customer } from "./data";
import { computePeerStats } from "./peers";
import { computeRecommendations } from "./recommendations";

const COUNTRY_NAMES: Record<string, string> = {
  PT: "Portugal",
  ES: "Spain",
  IT: "Italy",
  FR: "France",
  JP: "Japan",
  US: "the US",
  GB: "the UK",
  CH: "Switzerland",
  GR: "Greece",
  IS: "Iceland",
};

// Checks without a product requirement that a product can still complete (the gift pool sets money aside).
const DONE_BY_PRODUCT: Record<string, string> = { gift_set_aside: "gift_pool" };

interface TemplateCheck {
  id: string;
  label: string;
  productRequirement: string | null;
  peerKey?: string;
  action?: Check["action"];
}

function checkStatus(ch: TemplateCheck, customer: Customer, moment: Moment): Check["status"] {
  if (ch.productRequirement) return customer.products[ch.productRequirement] ? "ok" : "gap";
  const doneBy = DONE_BY_PRODUCT[ch.id];
  if (doneBy && customer.products[doneBy]) return "ok";
  if (moment.type === "wedding_guest") return "todo";
  if (moment.type === "moving") {
    if (ch.id === "rental_deposit") {
      return moment.sources.some((s) => s.label.startsWith("Rental deposit")) ? "ok" : "todo";
    }
    return ch.id === "address_change" || ch.id === "energy_contract" ? "todo" : "ok";
  }
  return "ok";
}

export function buildMomentView(customer: Customer, moment: Moment): MomentView {
  const template = getTemplate(moment.type) as { checks?: TemplateCheck[] } | null;
  const { peers, forgotPcts } = computePeerStats(customer, moment);
  const recommendations = computeRecommendations(customer, moment, peers);

  const checks: Check[] = (template?.checks ?? [])
    // A rental deposit is irrelevant when buying.
    .filter((ch) => !(ch.id === "rental_deposit" && moment.attrs.housing === "buy"))
    .map((ch) => {
      const status = checkStatus(ch, customer, moment);
      const country = moment.attrs.country;
      return {
        id: ch.id,
        label: ch.label.replace("{countryName}", country ? COUNTRY_NAMES[country] ?? country : "your destination"),
        status,
        peerMissedPct: ch.peerKey ? forgotPcts[ch.peerKey] : undefined,
        // No product button once the customer holds it.
        action: status === "ok" ? undefined : ch.action,
      };
    });

  return {
    moment,
    readiness: { done: checks.filter((c) => c.status === "ok").length, total: checks.length },
    checks,
    peers,
    recommendations,
  };
}
