import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenant";

// Editable tenant content, v1 scope: rules + news. (Modpacks, galleries,
// polls etc. are pvpers-only features for now.)

// Shape mirrors src/data/rules.json ({ title, body }) with explicit ordering.
export const tenantRules = pgTable(
  "tenant_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
  },
  (t) => [index("tenant_rules_tenant_idx").on(t.tenantId)],
);

// Plain-text body; blank-line-separated paragraphs, same convention as news.json.
export const tenantNews = pgTable(
  "tenant_news",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    tags: text("tags").array().notNull().default([]),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("tenant_news_tenant_published_idx").on(t.tenantId, t.publishedAt)],
);
