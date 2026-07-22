// Temporary dev seed: creates the "testfall" tenant for manual verification.
import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";

async function main() {
  const { db } = await import("../src/db/client");
  const { tenants, tenantRules, tenantNews } = await import("../src/db/schema");

  await db.delete(tenants).where(eq(tenants.slug, "testfall"));
  const [t] = await db
    .insert(tenants)
    .values({
      slug: "testfall",
      name: "Testfall SMP",
      serverIp: "mc.testfall.example",
      bedrockPort: 19132,
      discordInvite: "https://discord.gg/example",
      accentColor: "#55ffff",
      pistatsUrl: "http://stained.dathost.net:17249",
      config: {
        tagline: "A test server for the platform",
        description: "First paragraph about the server.\n\nSecond paragraph with more detail.",
        serverVersion: "Paper 26.1",
        gameplayTags: ["Survival", "SMP"],
        staff: [{ name: "carsonxd", role: "Owner" }],
      },
    })
    .returning({ id: tenants.id });

  await db.insert(tenantRules).values([
    { tenantId: t.id, position: 0, title: "Be cool", body: "Just be cool." },
    { tenantId: t.id, position: 1, title: "No cheating", body: "No hacked clients.\n\nCosmetic mods are fine." },
  ]);
  await db.insert(tenantNews).values([
    { tenantId: t.id, title: "We exist now", body: "The site is live.\n\nCome say hi.", tags: ["Site Update"] },
  ]);

  console.log("seeded tenant", t.id);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
