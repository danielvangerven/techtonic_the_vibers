import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPersonas } from "@/lib/data";
import { getMomentsForCustomer } from "@/lib/store";
import { buildMomentView } from "@/lib/engine";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const personas = getPersonas();
  const customer = personas.find((p) => p.id === session.customerId) || {
    id: session.customerId,
    name: session.name,
    age: 29,
    ageBand: "18-29" as const,
    household: "single" as const,
    region: "Flanders",
    city: "Ghent",
    passwordHash: "",
    products: { cancellation_cover: true, travel_medical: false, home_insurance: true, hospitalisation: true, pension_savings: true },
    transactions: [],
  };

  const moments = getMomentsForCustomer(session.customerId);
  const timeline = moments.map((m) => buildMomentView(customer, m));

  return NextResponse.json(timeline);
}
