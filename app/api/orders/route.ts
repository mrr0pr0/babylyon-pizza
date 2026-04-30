import { NextResponse } from "next/server";
import { z } from "zod";

const createOrderSchema = z.object({
  locationId: z.number().int().positive(),
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().min(6),
    email: z.string().email(),
    address: z.string().optional(),
  }),
  deliveryType: z.enum(["henting", "levering"]),
  items: z
    .array(
      z.object({
        menuItemId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        linePrice: z.number().nonnegative(),
        modifiers: z.record(z.string(), z.array(z.string())).optional(),
      }),
    )
    .min(1),
  discountCode: z.string().optional(),
  discountAmount: z.number().nonnegative().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ugyldig bestilling.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json({
    orderId: Math.floor(Math.random() * 100000),
    status: "mottatt",
  });
}
