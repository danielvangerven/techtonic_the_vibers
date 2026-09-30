import { NextResponse } from "next/server";
import { authenticate, notFound, unauthorized } from "@/lib/api";
import { deleteMoment, getMoment } from "@/lib/store";
import { buildMomentView } from "@/lib/engine";

type Params = { params: Promise<{ id: string }> };

/** One moment of the logged-in customer. Another customer's moment is a 404, never a 403. */
export async function GET(_req: Request, { params }: Params) {
  const auth = await authenticate();
  if (!auth) return unauthorized();

  const moment = await getMoment(auth.customerId, (await params).id);
  if (!moment) return notFound();
  return NextResponse.json(buildMomentView(auth.customer, moment));
}

/** "Remove / that's wrong": deletes the moment and keeps detection from bringing it back. */
export async function DELETE(_req: Request, { params }: Params) {
  const auth = await authenticate();
  if (!auth) return unauthorized();

  const { id } = await params;
  if (!(await deleteMoment(auth.customerId, id))) return notFound();
  return NextResponse.json({ ok: true, deletedId: id });
}
