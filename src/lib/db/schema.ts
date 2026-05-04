import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", [
  "mottatt",
  "forberedes",
  "klar",
  "levert",
]);

export const deliveryTypeEnum = pgEnum("delivery_type", [
  "henting",
  "levering",
]);
export const modifierTypeEnum = pgEnum("modifier_type", [
  "sauce",
  "remove",
  "extra",
  "addon",
]);

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  phone: varchar("phone", { length: 40 }).notNull(),
  address: text("address").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const locationHours = pgTable("location_hours", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Monday, 6 = Sunday
  openTime: varchar("open_time", { length: 5 }).notNull(), // HH:MM format
  closeTime: varchar("close_time", { length: 5 }).notNull(), // HH:MM format
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description").notNull(),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id),
  imageUrl: text("image_url"),
  allergens: text("allergens").array().notNull().default([]),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const itemVariants = pgTable("item_variants", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id")
    .notNull()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 80 }).notNull(),
  priceDelta: numeric("price_delta", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
});

export const itemModifiers = pgTable("item_modifiers", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id")
    .notNull()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  type: modifierTypeEnum("type").notNull(),
  label: varchar("label", { length: 120 }).notNull(),
  priceDelta: numeric("price_delta", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  isRequired: boolean("is_required").notNull().default(false),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 140 }).notNull(),
  email: varchar("email", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  address: text("address"),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  status: orderStatusEnum("status").notNull().default("mottatt"),
  deliveryType: deliveryTypeEnum("delivery_type").notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  discountCode: varchar("discount_code", { length: 80 }),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: integer("menu_item_id")
    .notNull()
    .references(() => menuItems.id),
  variantId: integer("variant_id").references(() => itemVariants.id),
  quantity: integer("quantity").notNull().default(1),
  modifiers: jsonb("modifiers").notNull().default({}),
  linePrice: numeric("line_price", { precision: 10, scale: 2 }).notNull(),
});

export const categoryRelations = relations(categories, ({ many }) => ({
  menuItems: many(menuItems),
}));

export const locationRelations = relations(locations, ({ many }) => ({
  menuItems: many(menuItems),
  orders: many(orders),
  hours: many(locationHours),
}));
