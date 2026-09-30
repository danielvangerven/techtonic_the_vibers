import { NextResponse } from "next/server";
import { authenticate, unauthorized } from "@/lib/api";
import { getMoments } from "@/lib/store";
import { momentTitle } from "@/lib/format";

/** The logged-in customer's transactions, newest first, with the moment each one supports. */
export async function GET() {
  const auth = await authenticate();
  if (!auth) return unauthorized();

  const moments = await getMoments(auth.customerId);
  const transactions = [...(auth.customer.transactions ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((tx) => {
      const moment = moments.find((m) =>
        m.sources.some(
          (s) =>
            s.kind === "transaction" &&
            (s.label.startsWith(tx.merchant.slice(0, 40)) ||
              (tx.type === "rental_deposit" && s.label.startsWith("Rental deposit")) ||
              (tx.type === "notary_deposit" && s.label.startsWith("Notary deposit"))),
        ),
      );
      return {
        date: tx.date,
        merchant: tx.merchant,
        description: tx.description,
        amount: tx.amount,
        category: tx.type,
        ...(moment ? { moment: { id: moment.id, title: momentTitle(moment) } } : {}),
      };
    });
  return NextResponse.json({ transactions });
}
