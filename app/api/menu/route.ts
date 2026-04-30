import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { categoryNames, mockMenuItems } from "@/src/lib/mock-data";

const querySchema = z.object({
  location: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    location: request.nextUrl.searchParams.get("location"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig lokasjon." }, { status: 400 });
  }

  const grouped = categoryNames.map((category) => ({
    category,
    items: mockMenuItems.filter(
      (item) => item.location === parsed.data.location && item.category === category,
    ),
  }));

  return NextResponse.json({ location: parsed.data.location, categories: grouped });
}
