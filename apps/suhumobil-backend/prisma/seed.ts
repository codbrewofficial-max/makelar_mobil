import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const ownerPasswordHash = await bcrypt.hash("owner12345", 10);
  const adminPasswordHash = await bcrypt.hash("admin12345", 10);

  const owner = await prisma.user.upsert({
    where: { email: "owner@suhumobil.com" },
    update: {},
    create: {
      name: "Owner SuhuMobil",
      email: "owner@suhumobil.com",
      passwordHash: ownerPasswordHash,
      role: "OWNER",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@suhumobil.com" },
    update: {},
    create: {
      name: "Admin SuhuMobil",
      email: "admin@suhumobil.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const defaultSettings: Record<string, unknown> = {
    site_title: "SuhuMobil - Mobil Bekas Terkurasi",
    whatsapp_number: "6281234567890",
    social_links: { instagram: "", tiktok: "", youtube: "" },
    storage_quota_gb: 1,
    watermark: { label: "Powered by SuhuMobil", link: "https://suhumobil.com" },
    business_profile: {
      logoUrl: null,
      name: "SuhuMobil",
      tagline: "",
      description: "",
      address: "",
      phone: "",
    },
    gtm_id: "",
    ga4_id: "",
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value: value as any },
    });
  }

  console.log("Seed selesai:");
  console.log(" - Owner:", owner.email, "(password: owner12345)");
  console.log(" - Admin:", admin.email, "(password: admin12345)");
  console.log(" - Settings default sudah dibuat");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
