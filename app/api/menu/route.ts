import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

const querySchema = z.object({
  location: z.string().min(1),
});

const sql = neon(process.env.DATABASE_URL || "");

const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    location: request.nextUrl.searchParams.get("location"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig lokasjon." }, { status: 400 });
  }

  try {
    // Fetch menu items from database
    const menuItemsResult = await sql`
      SELECT 
        mi.id,
        mi.name,
        mi.description,
        mi.base_price as "fromPrice",
        mi.image_url as "imageUrl",
        c.name as category,
        l.slug as location,
        mi.allergens
      FROM menu_items mi
      JOIN categories c ON mi.category_id = c.id
      JOIN locations l ON mi.location_id = l.id
      WHERE l.slug = ${parsed.data.location} AND mi.is_available = true
      ORDER BY c.sort_order, mi.name
    `;

    // Group by category
    const grouped = Array.from(
      new Map(
        menuItemsResult.map((item: any) => [item.category, item.category])
      ).entries()
    ).map(([category]) => ({
      category,
      items: menuItemsResult.filter((item: any) => item.category === category),
    }));

    // Fetch location hours from database
    let hours: any[] = [];
    try {
      const result = await sql`
        SELECT 
          lh.day_of_week,
          lh.open_time,
          lh.close_time,
          l.slug
        FROM location_hours lh
        JOIN locations l ON l.id = lh.location_id
        WHERE l.slug = ${parsed.data.location}
        ORDER BY lh.day_of_week
      `;
      hours = result || [];
    } catch (error) {
      console.error("Error fetching location hours:", error);
    }

    return NextResponse.json({
      location: parsed.data.location,
      categories: grouped,
      hours: hours.map((h: any) => ({
        day: dayNames[h.day_of_week],
        dayOfWeek: h.day_of_week,
        openTime: h.open_time,
        closeTime: h.close_time,
      })),
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Feil ved henting av meny." },
      { status: 500 }
    );
  }
}
