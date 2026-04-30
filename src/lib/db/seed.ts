import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL missing in environment variables.");
}

const sql = neon(databaseUrl);

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Seed locations
    console.log("📍 Seeding locations...");
    const locationsResult = await sql`
      INSERT INTO locations (name, slug, phone, address, is_active)
      VALUES 
        ('Babylon Pizza Ås', 'as', '+47 12 34 56 78', 'Hovedgaten 123, 1430 Ås', true),
        ('Babylon Pizza Vestby', 'vestby', '+47 87 65 43 21', 'Storgaten 456, 1540 Vestby', true)
      RETURNING id, name;
    `;

    const asLocationId = locationsResult[0].id;
    const vestbyLocationId = locationsResult[1].id;
    console.log(
      `✓ Created locations: ${locationsResult.map((l) => l.name).join(", ")}`,
    );

    // Seed categories
    console.log("📂 Seeding categories...");
    const categoryNames = [
      "Kebab",
      "Grill",
      "Salater",
      "Barnemeny",
      "Pizza",
      "Tilbehor",
      "Drikke",
    ];
    const categoriesResult = await sql`
      INSERT INTO categories (name, sort_order)
      VALUES 
        ('Kebab', 1),
        ('Grill', 2),
        ('Salater', 3),
        ('Barnemeny', 4),
        ('Pizza', 5),
        ('Tilbehor', 6),
        ('Drikke', 7)
      RETURNING id, name;
    `;

    const categoryMap = Object.fromEntries(
      categoriesResult.map((cat: { id: number; name: string }) => [
        cat.name,
        cat.id,
      ]),
    );
    console.log(`✓ Created ${categoriesResult.length} categories`);

    // Seed menu items
    console.log("🍕 Seeding menu items...");
    const menuItemsResult = await sql`
      INSERT INTO menu_items (name, description, base_price, category_id, location_id, allergens, is_available)
      VALUES 
        ('Rull Kebab', 'Kebabkjott med salat og valgfri saus i hjemmelaget brod.', 139.00, ${categoryMap.Kebab}, ${asLocationId}, ARRAY['Gluten'], true),
        ('Babylon Spesial', 'Tomatsaus, ost, kebabkjott, paprika, log og jalapenos.', 214.00, ${categoryMap.Pizza}, ${asLocationId}, ARRAY['Melk', 'Gluten'], true),
        ('Cheeseburger Tall.', 'Serveres med pommes frites og dressing.', 149.00, ${categoryMap.Grill}, ${vestbyLocationId}, ARRAY['Melk', 'Gluten'], true)
      RETURNING id, name;
    `;

    const kebabId = menuItemsResult[0].id;
    const pizzaId = menuItemsResult[1].id;
    const burgerId = menuItemsResult[2].id;
    console.log(`✓ Created ${menuItemsResult.length} menu items`);

    // Seed item variants
    console.log("🔀 Seeding item variants...");
    await sql`
      INSERT INTO item_variants (item_id, label, price_delta)
      VALUES 
        (${kebabId}, 'Stor', 50.00),
        (${kebabId}, 'Medium', 0.00);
    `;
    console.log("✓ Created item variants");

    // Seed item modifiers
    console.log("🌶️ Seeding item modifiers...");
    await sql`
      INSERT INTO item_modifiers (item_id, type, label, price_delta, is_required)
      VALUES 
        (${kebabId}, 'sauce', 'Hvitløkssaus', 0.00, false),
        (${kebabId}, 'sauce', 'Sriracha', 0.00, false),
        (${pizzaId}, 'extra', 'Ekstra kjøtt', 50.00, false);
    `;
    console.log("✓ Created item modifiers");

    // Seed customers
    console.log("👤 Seeding customers...");
    const customersResult = await sql`
      INSERT INTO customers (name, email, phone, address)
      VALUES 
        ('Jon Hansen', 'jon@example.com', '+47 98 76 54 32', 'Bekkeveien 10, 1430 Ås'),
        ('Maria Olsen', 'maria@example.com', '+47 99 88 77 66', 'Storgaten 50, 1540 Vestby')
      RETURNING id, name;
    `;

    const jonId = customersResult[0].id;
    const mariaId = customersResult[1].id;
    console.log(
      `✓ Created customers: ${customersResult.map((c) => c.name).join(", ")}`,
    );

    // Seed orders
    console.log("📦 Seeding orders...");
    const ordersResult = await sql`
      INSERT INTO orders (location_id, customer_id, status, delivery_type, total, discount_code)
      VALUES 
        (${asLocationId}, ${jonId}, 'forberedes', 'levering', 389.00, NULL),
        (${vestbyLocationId}, ${mariaId}, 'levert', 'henting', 149.00, NULL)
      RETURNING id;
    `;

    const order1Id = ordersResult[0].id;
    const order2Id = ordersResult[1].id;
    console.log(`✓ Created ${ordersResult.length} orders`);

    // Seed order items
    console.log("🛒 Seeding order items...");
    await sql`
      INSERT INTO order_items (order_id, menu_item_id, quantity, line_price, modifiers)
      VALUES 
        (${order1Id}, ${kebabId}, 2, 278.00, '{}'::jsonb),
        (${order1Id}, ${pizzaId}, 1, 264.00, '{"extra": "Ekstra kjøtt"}'::jsonb),
        (${order2Id}, ${burgerId}, 1, 149.00, '{}'::jsonb);
    `;
    console.log("✓ Created order items");

    console.log("\n✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
