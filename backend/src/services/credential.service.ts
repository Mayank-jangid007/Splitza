// =============================================================
//  Splitza — credential.service.ts
//  Encrypt / decrypt pool credentials + authorized access.
// =============================================================

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { prisma } from "../lib/prisma";

export class CredentialAccessError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusHint: 400 | 403 | 404 | 500 = 403
  ) {
    super(message);
    this.name = "CredentialAccessError";
  }
}

function getKey(): Buffer {
  const hex = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new CredentialAccessError(
      "ENCRYPTION_KEY_MISSING",
      "CREDENTIAL_ENCRYPTION_KEY must be a 64-char hex string (32 bytes).",
      500
    );
  }
  return Buffer.from(hex, "hex");
}

export async function encryptField(
  plaintext: string,
  iv?: Buffer
): Promise<{ ciphertext: string; iv: string; keyId: string }> {
  const key = getKey();
  const ivBuf = iv ?? randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, ivBuf);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: Buffer.concat([encrypted, authTag]).toString("base64"),
    iv: ivBuf.toString("base64"),
    keyId: process.env.CREDENTIAL_KEY_ID ?? "local-dev-key-v1",
  };
}

export async function decryptField(ciphertextB64: string, ivB64: string): Promise<string> {
  const key = getKey();
  const data = Buffer.from(ciphertextB64, "base64");
  if (data.length < 17) {
    throw new CredentialAccessError("DECRYPT_FAILED", "Invalid credential ciphertext.", 500);
  }
  const authTag = data.subarray(data.length - 16);
  const encrypted = data.subarray(0, data.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export type CredentialPayload = {
  username?: string;
  password?: string;
  inviteLink?: string;
};

/** Build Prisma create payload — all fields share one IV. */
export async function buildCredentialPayload(
  poolId: string,
  creds?: CredentialPayload | null
): Promise<{
  poolId: string;
  encryptedUsername: string | null;
  encryptedPassword: string | null;
  encryptedInviteLink: string | null;
  iv: string;
  encryptionKeyId: string;
} | null> {
  if (!creds || (!creds.username && !creds.password && !creds.inviteLink)) {
    return null;
  }

  const sharedIv = randomBytes(16);
  let encryptedUsername: string | null = null;
  let encryptedPassword: string | null = null;
  let encryptedInviteLink: string | null = null;
  let keyId = process.env.CREDENTIAL_KEY_ID ?? "local-dev-key-v1";

  if (creds.username?.trim()) {
    const enc = await encryptField(creds.username.trim(), sharedIv);
    encryptedUsername = enc.ciphertext;
    keyId = enc.keyId;
  }
  if (creds.password?.trim()) {
    const enc = await encryptField(creds.password.trim(), sharedIv);
    encryptedPassword = enc.ciphertext;
    keyId = enc.keyId;
  }
  if (creds.inviteLink?.trim()) {
    const enc = await encryptField(creds.inviteLink.trim(), sharedIv);
    encryptedInviteLink = enc.ciphertext;
    keyId = enc.keyId;
  }

  return {
    poolId,
    encryptedUsername,
    encryptedPassword,
    encryptedInviteLink,
    iv: sharedIv.toString("base64"),
    encryptionKeyId: keyId,
  };
}

export interface DecryptedCredentials {
  username: string | null;
  password: string | null;
  inviteLink: string | null;
  seatNo: number;
  pin: string | null;
}

/**
 * Return decrypted credentials only if the caller is the host
 * or an ACTIVE paid member of the pool.
 */
export async function getPoolCredentials(
  poolId: string,
  userId: string
): Promise<DecryptedCredentials> {
  const membership = await prisma.membership.findUnique({
    where: { userId_poolId: { userId, poolId } },
    select: {
      role: true,
      status: true,
      joinedAt: true,
    },
  });

  if (!membership) {
    throw new CredentialAccessError(
      "NOT_A_MEMBER",
      "You must be a member of this pool to view credentials.",
      403
    );
  }

  const isHost = membership.role === "HOST";
  const isPaidMember = membership.role === "MEMBER" && membership.status === "ACTIVE";

  if (!isHost && !isPaidMember) {
    throw new CredentialAccessError(
      "PAYMENT_REQUIRED",
      "Complete payment before credentials are unlocked.",
      403
    );
  }

  const record = await prisma.poolCredential.findUnique({
    where: { poolId },
  });

  if (!record) {
    throw new CredentialAccessError(
      "CREDENTIALS_NOT_SET",
      "The host has not shared credentials for this pool yet.",
      404
    );
  }

  const username = record.encryptedUsername
    ? await decryptField(record.encryptedUsername, record.iv)
    : null;
  const password = record.encryptedPassword
    ? await decryptField(record.encryptedPassword, record.iv)
    : null;
  const inviteLink = record.encryptedInviteLink
    ? await decryptField(record.encryptedInviteLink, record.iv)
    : null;

  // Seat number = count of ACTIVE members ordered by join time (host = 1)
  const activeMembers = await prisma.membership.findMany({
    where: { poolId, status: "ACTIVE" },
    orderBy: { joinedAt: "asc" },
    select: { userId: true },
  });
  const seatNo = Math.max(1, activeMembers.findIndex((m) => m.userId === userId) + 1);

  return {
    username,
    password,
    inviteLink,
    seatNo,
    pin: null, // profile PIN is not stored separately yet
  };
}
