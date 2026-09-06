import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Splitza database...\n");

  // -------------------------------------------------------------------------
  // 1. Create Admin
  // -------------------------------------------------------------------------
  const adminPass = await bcrypt.hash("admin@splitza123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@splitza.in" },
    update: {},
    create: {
      name: "Splitza Admin",
      email: "admin@splitza.in",
      password: adminPass,
      role: "ADMIN",
      trustScore: 100,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // -------------------------------------------------------------------------
  // 2. Create Host users
  // -------------------------------------------------------------------------
  const hostPass = await bcrypt.hash("host@splitza123", 12);
  const hosts = await Promise.all([
    prisma.user.upsert({
      where: { email: "rahul@splitza-demo.in" },
      update: {},
      create: { name: "Rahul Mehta", email: "rahul@splitza-demo.in", phone: "9876543210", password: hostPass, role: "HOST", trustScore: 98 },
    }),
    prisma.user.upsert({
      where: { email: "priya@splitza-demo.in" },
      update: {},
      create: { name: "Priya Sharma", email: "priya@splitza-demo.in", phone: "9876543211", password: hostPass, role: "HOST", trustScore: 100 },
    }),
  ]);
  console.log(`✅ ${hosts.length} host users created`);

  // -------------------------------------------------------------------------
  // 3. Create Co-host users
  // -------------------------------------------------------------------------
  const cohostPass = await bcrypt.hash("cohost@splitza123", 12);
  const cohosts = await Promise.all([
    prisma.user.upsert({
      where: { email: "arjun@splitza-demo.in" },
      update: {},
      create: { name: "Arjun Mehta", email: "arjun@splitza-demo.in", phone: "9876543212", password: cohostPass, role: "COHOST", trustScore: 95 },
    }),
    prisma.user.upsert({
      where: { email: "kavya@splitza-demo.in" },
      update: {},
      create: { name: "Kavya Nair", email: "kavya@splitza-demo.in", phone: "9876543213", password: cohostPass, role: "COHOST", trustScore: 92 },
    }),
    prisma.user.upsert({
      where: { email: "rohan@splitza-demo.in" },
      update: {},
      create: { name: "Rohan Gupta", email: "rohan@splitza-demo.in", phone: "9876543214", password: cohostPass, role: "COHOST", trustScore: 88 },
    }),
  ]);
  console.log(`✅ ${cohosts.length} co-host users created`);

  // -------------------------------------------------------------------------
  // 4. Create Plans
  // -------------------------------------------------------------------------
  const netflixPlan = await prisma.plan.upsert({
    where: { id: "plan-seed-netflix-001" },
    update: {},
    create: {
      id: "plan-seed-netflix-001",
      service: "Netflix",
      tier: "Standard (4K)",
      description: "Netflix Standard 4K plan. Shared responsibly. OTP relayed instantly.",
      totalSlots: 4,
      filledSlots: 2,
      pricePerSlot: 249,
      billingCycle: "monthly",
      hostId: hosts[0].id,
      status: "ACTIVE",
      verifiedAt: new Date(),
      slots: {
        create: [
          { id: "slot-seed-n1", status: "ACTIVE", coHostId: cohosts[0].id, escrowLocked: true, escrowAmount: 249 },
          { id: "slot-seed-n2", status: "ACTIVE", coHostId: cohosts[1].id, escrowLocked: true, escrowAmount: 249 },
          { id: "slot-seed-n3", status: "OPEN" },
          { id: "slot-seed-n4", status: "OPEN" },
        ],
      },
    },
  });

  const spotifyPlan = await prisma.plan.upsert({
    where: { id: "plan-seed-spotify-001" },
    update: {},
    create: {
      id: "plan-seed-spotify-001",
      service: "Spotify",
      tier: "Family (6 users)",
      description: "Spotify Family plan. Stable host, 100% trust score.",
      totalSlots: 5,
      filledSlots: 3,
      pricePerSlot: 60,
      billingCycle: "monthly",
      hostId: hosts[1].id,
      status: "ACTIVE",
      verifiedAt: new Date(),
      slots: {
        create: [
          { id: "slot-seed-s1", status: "ACTIVE", coHostId: cohosts[0].id, escrowLocked: true, escrowAmount: 60 },
          { id: "slot-seed-s2", status: "ACTIVE", coHostId: cohosts[1].id, escrowLocked: true, escrowAmount: 60 },
          { id: "slot-seed-s3", status: "ACTIVE", coHostId: cohosts[2].id, escrowLocked: true, escrowAmount: 60 },
          { id: "slot-seed-s4", status: "OPEN" },
          { id: "slot-seed-s5", status: "OPEN" },
        ],
      },
    },
  });
  console.log("✅ Plans created:", netflixPlan.service, ",", spotifyPlan.service);

  // -------------------------------------------------------------------------
  // 5. Create Payments (seeded)
  // -------------------------------------------------------------------------
  await prisma.payment.upsert({
    where: { id: "pay-seed-001" },
    update: {},
    create: { id: "pay-seed-001", slotId: "slot-seed-n1", userId: cohosts[0].id, amount: 249, status: "ESCROWED", upiRef: "UPI-SEED-001" },
  });
  await prisma.payment.upsert({
    where: { id: "pay-seed-002" },
    update: {},
    create: { id: "pay-seed-002", slotId: "slot-seed-n2", userId: cohosts[1].id, amount: 249, status: "ESCROWED", upiRef: "UPI-SEED-002" },
  });
  await prisma.payment.upsert({
    where: { id: "pay-seed-003" },
    update: {},
    create: { id: "pay-seed-003", slotId: "slot-seed-s1", userId: cohosts[0].id, amount: 60, status: "ESCROWED", upiRef: "UPI-SEED-003" },
  });
  console.log("✅ Payments seeded");

  // -------------------------------------------------------------------------
  // 6. Create Trust Votes
  // -------------------------------------------------------------------------
  await prisma.trustVote.upsert({
    where: { slotId_voterId: { slotId: "slot-seed-n1", voterId: cohosts[0].id } },
    update: {},
    create: { slotId: "slot-seed-n1", voterId: cohosts[0].id, vote: "TRUST" },
  });
  await prisma.trustVote.upsert({
    where: { slotId_voterId: { slotId: "slot-seed-n2", voterId: cohosts[1].id } },
    update: {},
    create: { slotId: "slot-seed-n2", voterId: cohosts[1].id, vote: "TRUST" },
  });
  console.log("✅ Trust votes seeded");

  console.log("\n🎉 Seed complete!\n");
  console.log("Demo accounts:");
  console.log("  Admin  : admin@splitza.in / admin@splitza123");
  console.log("  Host   : rahul@splitza-demo.in / host@splitza123");
  console.log("  Host   : priya@splitza-demo.in / host@splitza123");
  console.log("  Co-host: arjun@splitza-demo.in / cohost@splitza123");
  console.log("  Co-host: kavya@splitza-demo.in / cohost@splitza123\n");
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
