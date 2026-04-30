import { NextResponse } from "next/server";
import { z } from "zod";

const discountSchema = z.object({
  code: z.string().min(2).max(32),
  subtotal: z.number().nonnegative(),
});

const discountMap: Record<string, number> = {
  BABYLON10: 0.1,
  AS100: 100,
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = discountSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig rabattkode." }, { status: 400 });
  }

  const code = parsed.data.code.toUpperCase();
  const discountValue = discountMap[code] ?? 0;
  const amount =
    discountValue <= 1
      ? Math.round(parsed.data.subtotal * discountValue)
      : Math.min(discountValue, parsed.data.subtotal);

  return NextResponse.json({
    valid: amount > 0,
    discountAmount: amount,
  });
}
