import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { amount, paymentMethodId } = await request.json();

    if (!amount || !paymentMethodId) {
      return NextResponse.json(
        { error: "Amount and payment method required" },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "nok",
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/confirmation`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    });
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Payment processing failed";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
