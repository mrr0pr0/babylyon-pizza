import { NextResponse } from "next/server";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

const createOrderSchema = z.object({
  locationId: z.number().int().positive().optional(),
  locationSlug: z.string().min(1).optional(),
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
  total: z.number().nonnegative(),
  discountCode: z.string().optional(),
  discountAmount: z.number().nonnegative().optional(),
}).refine((data) => Boolean(data.locationId || data.locationSlug), {
  message: "Location id eller slug er påkrevd.",
  path: ["locationId"],
});

const sql = neon(process.env.DATABASE_URL || "");

async function sendSmsNotification(phone: string, message: string) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      console.error("Twilio credentials not configured");
      return;
    }

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const response = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: phone,
        From: fromPhone,
        Body: message,
      }).toString(),
    });

    if (!response.ok) {
      console.error("Failed to send SMS:", await response.text());
    } else {
      console.log("SMS sent successfully to", phone);
    }
  } catch (error) {
    console.error("Error sending SMS notification:", error);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ugyldig bestilling.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    let resolvedLocationId = parsed.data.locationId;

    if (!resolvedLocationId && parsed.data.locationSlug) {
      const locationResult = await sql<{ id: number }[]>`
        SELECT id
        FROM locations
        WHERE slug = ${parsed.data.locationSlug}
        LIMIT 1
      `;

      if (!locationResult.length) {
        return NextResponse.json(
          { error: "Ugyldig lokasjon." },
          { status: 400 },
        );
      }

      resolvedLocationId = locationResult[0].id;
    }

    if (!resolvedLocationId) {
      return NextResponse.json(
        { error: "Ugyldig lokasjon." },
        { status: 400 },
      );
    }

    // Create or update customer by unique email
    const customerResult = await sql`
      INSERT INTO customers (name, email, phone, address)
      VALUES (${parsed.data.customer.name}, ${parsed.data.customer.email}, ${parsed.data.customer.phone}, ${parsed.data.customer.address || null})
      ON CONFLICT (email)
      DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address
      RETURNING id
    `;
    const customerId = customerResult[0].id;

    // Create order
    const orderResult = await sql`
      INSERT INTO orders (
        location_id,
        customer_id,
        delivery_type,
        total,
        status
      )
      VALUES (
        ${resolvedLocationId},
        ${customerId},
        ${parsed.data.deliveryType},
        ${parsed.data.total},
        'mottatt'
      )
      RETURNING id
    `;
    const orderId = orderResult[0].id;

    // Create order items
    for (const item of parsed.data.items) {
      await sql`
        INSERT INTO order_items (
          order_id,
          menu_item_id,
          quantity,
          line_price,
          modifiers
        )
        VALUES (
          ${orderId},
          ${item.menuItemId},
          ${item.quantity},
          ${item.linePrice},
          ${JSON.stringify(item.modifiers || {})}
        )
      `;
    }

    // Format order number
    const orderNumber = String(orderId).padStart(5, "#");
    
    const estimatedTime = "25-35 minutter";
    const customerMessage = `Babylon Pizza: Din ordre #${orderNumber} er mottatt! Estimert tid: ${estimatedTime}. Takk for din bestilling!`;
    const adminMessage = `Ny ordre ${orderNumber}: ${parsed.data.deliveryType}, totalt kr ${parsed.data.total}, kunde ${parsed.data.customer.name} (${parsed.data.customer.phone}).`;

    // Customer SMS confirmation
    await sendSmsNotification(parsed.data.customer.phone, customerMessage);

    // Admin SMS alert (configured to same number as TWILIO_PHONE_NUMBER per request)
    const adminPhone = process.env.TWILIO_PHONE_NUMBER;
    if (adminPhone) {
      await sendSmsNotification(adminPhone, adminMessage);
    }

    return NextResponse.json({
      orderId: orderId,
      orderNumber: orderNumber,
      status: "mottatt",
      estimatedTime,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Feil ved opprettelse av bestilling." },
      { status: 500 },
    );
  }
}
