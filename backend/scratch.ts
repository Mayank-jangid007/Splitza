import { createPool } from './src/services/createPool.service';

async function main() {
  try {
    const payload = {
      serviceType: "CUSTOM" as const,
      customName: "Netflix Split",
      totalPlanCostINR: 649,
      totalSeats: 4, 
      planMonths: 1,
      visibility: "PUBLIC" as const,
      hostUpiId: "host@upi", 
      hostId: "3e5a5960-449d-4766-9e67-0c7f2168926d" // mock user id
    };
    
    // First, let's find a valid user to use as hostId
    const { prisma } = await import('./src/lib/prisma');
    const user = await prisma.user.findFirst();
    if (user) {
      payload.hostId = user.id;
    }

    console.log("Calling createPool with:", payload);
    const result = await createPool(payload);
    console.log("Success!", result.pool.id);
  } catch (err) {
    console.error("Caught error:");
    console.error(err);
  }
}

main().catch(console.error);
