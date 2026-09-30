import type { Moment, MomentView, Check } from "./types";
import { getTemplate, Persona, Customer } from "./data";
import { computePeerStats } from "./peers";
import { computeRecommendations } from "./recommendations";

export function buildMomentView(
  customer: Persona | Customer,
  moment: Moment
): MomentView {
  const template = getTemplate(moment.type);
  const { peers, forgotPcts } = computePeerStats(customer, moment);
  const recommendations = computeRecommendations(customer, moment);

  const checks: Check[] = [];
  let doneCount = 0;

  if (template && template.checks) {
    for (const ch of template.checks) {
      let status: "ok" | "gap" | "todo" = "ok";
      let action = ch.action;

      if (ch.productRequirement) {
        const hasProduct = customer.products && customer.products[ch.productRequirement];
        if (hasProduct) {
          status = "ok";
          action = undefined; // No product button if already owned
        } else {
          status = "gap";
        }
      } else {
        // Deterministic heuristic checks
        if (moment.type === "wedding_guest") {
          status = "todo";
        } else if (moment.type === "moving") {
          if (ch.id === "address_change" || ch.id === "energy_contract") {
            status = "todo";
          } else {
            status = "ok";
          }
        } else {
          status = "ok";
        }
      }

      if (status === "ok") {
        doneCount++;
      }

      const peerMissed = ch.peerKey ? forgotPcts[ch.peerKey] : undefined;

      let label = ch.label;
      if (moment.attrs.country && label.includes("{countryName}")) {
        const countryNames: Record<string, string> = {
          PT: "Portugal",
          ES: "Spain",
          IT: "Italy",
          FR: "France",
          JP: "Japan",
          US: "the US",
          GB: "the UK",
          IS: "Iceland",
        };
        label = label.replace("{countryName}", countryNames[moment.attrs.country] || moment.attrs.country);
      }

      checks.push({
        id: ch.id,
        label,
        status,
        peerMissedPct: peerMissed,
        action,
      });
    }
  }

  const total = checks.length;
  return {
    moment,
    readiness: { done: doneCount, total },
    checks,
    peers,
    recommendations,
  };
}
