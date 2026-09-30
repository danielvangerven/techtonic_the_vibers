import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { deleteMomentForCustomer } from "@/lib/store";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = deleteMomentForCustomer(session.customerId, id);

  if (!deleted) {
    // IDOR protection: return 404 if moment does not belong to session's customer
    return NextResponse.json({ error: "Moment not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deletedId: id });
}
