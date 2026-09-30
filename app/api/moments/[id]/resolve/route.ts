import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPersonas } from "@/lib/data";
import { getMomentsForCustomer } from "@/lib/store";
import { buildMomentView } from "@/lib/engine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { productId } = body;

  const personas = getPersonas();
  const customer = personas.find((p) => p.id === session.customerId);

  if (customer && productId) {
    // Activate the product for this customer session
    customer.products[productId] = true;
    if (productId === "travel_medical") {
      customer.products["travel_medical"] = true;
    }
  }

  const moments = getMomentsForCustomer(session.customerId);
  const targetMoment = moments.find((m) => m.id === id);

  if (!targetMoment) {
    return NextResponse.json({ error: "Moment not found" }, { status: 404 });
  }

  const updatedView = buildMomentView(customer || ({} as any), targetMoment);
  return NextResponse.json({
    ok: true,
    message: `Activated ${productId}. Readiness is now ${updatedView.readiness.done}/${updatedView.readiness.total}.`,
    momentView: updatedView,
  });
}
