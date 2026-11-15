import { prisma } from "./prisma";
import { LEGAL_VERSION } from "./legal";

/** True when the user has accepted the current legal version. */
export async function hasCurrentConsent(userId: string): Promise<boolean> {
  const row = await prisma.userConsent.findFirst({
    where: { userId, version: LEGAL_VERSION },
    select: { id: true },
  });
  return Boolean(row);
}

/** Idempotently record consent for the current legal version. */
export async function recordConsent(userId: string): Promise<void> {
  if (await hasCurrentConsent(userId)) return;
  await prisma.userConsent.create({
    data: { userId, version: LEGAL_VERSION },
  });
}
