import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const createPaymentSchema = z.object({
  amount: z.number().int().positive(),
  paymentMethodId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ugyldig betalingsdata." },
        { status: 400 }
      );
    }

    const { amount } = parsed.data;

    if (amount < 100) {
      return NextResponse.json(
        { error: "Minimumsbelop for kortbetaling er kr 1." },
        { status: 400 }
      );
    }

    // Stripe card-only payment intent (confirmation happens client-side)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "nok",
      payment_method_types: ["card"],
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Betaling feilet.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
