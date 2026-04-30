# Babylon Pizza — Ordering System Scaffold Prompt

## Context
I am building an online food ordering system for Babylon Pizza, a Norwegian pizza and kebab restaurant chain with locations in Ås, Vestby, and Drøbak.

**Important scope:** I am ONLY building the ordering/booking system. The public marketing homepage is being built separately by another developer. My system starts when a customer clicks "Bestill Take Away" or navigates directly to the ordering URL.

The current system they use is easybooking.no — I am replacing it with a custom solution built in Next.js 14 (App Router) with a Neon PostgreSQL database.

## What I need you to build

Scaffold a complete Next.js 14 App Router project for the ordering system with the following:

### 1. Project setup
- Next.js 14 with App Router and TypeScript strict mode
- Tailwind CSS configured with the brand CSS variables below
- Drizzle ORM connected to Neon PostgreSQL
- Zustand for cart state
- NextAuth.js for customer accounts
- Framer Motion for animations
- Google Fonts: Bebas Neue (display) + DM Sans (body)

### 2. Brand design tokens (use as CSS variables, never hardcode)
```
--color-bg:      #0a0a0a
--color-surface: #141414
--color-border:  #1f1f1f
--color-gold:    #f5a800
--color-gold-dim:#c88a00
--color-text:    #f0f0f0
--color-muted:   #888888
--color-danger:  #e03c3c
--color-success: #2ecc71
```

### 3. Database schema (Drizzle + Neon)
Create `src/lib/db/schema.ts` with these tables:
- `locations` (id, name, slug, phone, address, is_active)
- `categories` (id, name, sort_order) — Kebab, Grill, Salater, Barnemeny, Pizza, Tilbehør, Drikke
- `menu_items` (id, name, description, base_price, category_id, location_id, image_url, allergens[], is_available)
- `item_variants` (id, item_id, label, price_delta) — e.g. Liten/Medium/Stor
- `item_modifiers` (id, item_id, type [sauce|remove|extra|addon], label, price_delta, is_required)
- `customers` (id, name, email, phone, address)
- `orders` (id, location_id, customer_id, status, delivery_type, total, discount_code, discount_amount, created_at)
- `order_items` (id, order_id, menu_item_id, variant_id, quantity, modifiers jsonb, line_price)

### 4. Pages to scaffold

**`/[location]`** — Menu browsing page
- Sticky top nav: black bg, gold logo text "BABYLON" + location name, phone number on right
- Category tab bar (horizontal scroll on mobile): Kebab | Grill | Salater | Barnemeny | Pizza | Tilbehør | Drikke
- 3-column menu grid (2 on tablet, 1 on mobile) of MenuItemCard components
- Fixed cart sidebar on right (desktop) / bottom drawer (mobile)

**`/[location]/checkout`** — Checkout page
- Step 2 of 3
- Form: name, phone, email
- Delivery type toggle: "Henting" (pickup) / "Levering" (delivery)
- If delivery: address field appears
- Order summary (read-only cart review)

**`/[location]/confirmation`** — Order confirmed
- Step 3 of 3
- Big gold checkmark animation
- Order number, estimated time
- "Din ordre er mottatt!" message

**`/admin`** — Restaurant admin panel (protected)
- List of incoming orders, newest first
- Each order card shows: order ID, items, total, delivery type, customer name+phone, time
- Status buttons: Mottatt → Forberedes → Klar → Levert
- Auto-refresh every 30 seconds

### 5. Key components to generate

**`MenuItemCard`**
- Dark surface card with image top
- Item name, description (truncated, "Les mer" expands)
- Gold price "Fra kr 214,-"
- Green "VELG" button
- On hover: gold border glow animation

**`ItemModal`** (popup when VELG is clicked)
- Product image, name, full description, allergens
- "VELG SAUS" section with OBLIGATORISK badge — radio options: Mild, Medium, Sterk, Uten saus
- "TA BORT" collapsible — checkboxes to remove ingredients
- "EKSTRA" collapsible — paid add-ons
- "LEGG TIL" collapsible — extra toppings
- Quantity selector (−/+)
- "Legg til i ordre — kr X,-" button (disabled until sauce selected)

**`CartSidebar`**
- Step indicator at top (3 steps, gold active)
- Items list with −/+ quantity and delete button
- Discount code input + "Registrer" button
- "Tøm handlekurv" (clear cart) button
- Total in bold
- "Tilbake" grey button + "Send inn ordre" / "Neste" gold CTA

**`StepIndicator`**
- 3 steps connected by a line
- Gold filled = active/complete, grey = future

### 6. API routes
- `GET /api/menu?location=[slug]` — return menu items grouped by category
- `POST /api/orders` — create order (validate with Zod, return order ID)
- `POST /api/discount` — validate discount code, return discount amount
- `GET /api/orders/[id]` — get order status (for confirmation page polling)
- `PATCH /api/orders/[id]/status` — admin only, update order status

### 7. Cart store (Zustand)
File: `src/lib/store/cart.ts`
```ts
// locationId scoped cart
// addItem, removeItem, updateQty, clearCart
// discountCode, discountAmount, applyDiscount
// Persist to localStorage
// If location changes → confirm dialog → clear cart
```

### 8. Norwegian UI text
All customer-facing text in Bokmål. Key strings:
- "Velg" / "VELG" = Select
- "Send inn ordre" = Place order  
- "Din ordre" = Your order
- "Tøm handlekurv" = Clear cart
- "Obligatorisk" = Required
- "Totalt" = Total
- "Henting" = Pickup
- "Levering" = Delivery
- "Neste" = Next
- "Tilbake" = Back
- "Din ordre er mottatt!" = Your order has been received!

### 9. Environment variables needed
Create `.env.example`:
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
VIPPS_CLIENT_ID=
VIPPS_CLIENT_SECRET=
VIPPS_MERCHANT_SERIAL=
STRIPE_SECRET_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Design constraints
- Dark theme only — bg #0a0a0a, surfaces #141414
- Gold (#f5a800) is the ONLY accent color — used for CTAs, active states, prices, borders on hover
- No purple, no gradients on CTAs, no rounded-full pill buttons
- Typography: Bebas Neue for headings/labels, DM Sans for body text
- Buttons are rectangular with slight radius (4–8px), uppercase, wide letter-spacing
- The ordering UI should feel fast, dense, and functional — not playful

Start by generating the folder structure, then `schema.ts`, then `globals.css` with the design tokens, then the components in this order: MenuItemCard → ItemModal → CartSidebar → StepIndicator → the pages.
