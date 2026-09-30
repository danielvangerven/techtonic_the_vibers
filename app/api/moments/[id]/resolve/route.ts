import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, jsonError, notFound, readJson, unauthorized } from "@/lib/api";
import { activateProduct, getCustomer, getMoment } from "@/lib/store";
import { buildMomentView } from "@/lib/engine";
import { PRODUCT_IDS, PRODUCTS } from "@/lib/products";

const Body = z.object({ productId: z.enum(PRODUCT_IDS) });

type Params = { params: Promise<{ id: string }> };

/** Activate a product or deal for a moment: { productId } → the updated MomentView. */
export async function POST(req: Request, { params }: Params) {
  const auth = await authenticate();
  if (!auth) return unauthorized();

  const moment = await getMoment(auth.customerId, (await params).id);
  if (!moment) return notFound();

  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return jsonError("Unknown product", 400);
  const { productId } = parsed.data;

  await activateProduct(auth.customerId, productId);
  const customer = (await getCustomer(auth.customerId))!;
  const momentView = buildMomentView(customer, moment);
  return NextResponse.json({
    ok: true,
    message: `Activated ${PRODUCTS[productId].name}. Readiness is now ${momentView.readiness.done}/${momentView.readiness.total}.`,
    momentView,
  });
}
