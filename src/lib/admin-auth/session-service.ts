import { prisma } from "@/lib/prisma";
import {
  ADMIN_ALLOWED_ROLES,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/admin-auth/constants";
import { generateSessionToken, hashSessionToken } from "@/lib/admin-auth/token";
import type { AdminSessionRecord, AdminSessionUser } from "@/lib/admin-auth/types";

function isAllowedRole(role: string): role is (typeof ADMIN_ALLOWED_ROLES)[number] {
  return (ADMIN_ALLOWED_ROLES as readonly string[]).includes(role);
}

function toSessionUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
}): AdminSessionUser | null {
  if (!isAllowedRole(user.role)) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function createAdminSession(adminUserId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.adminSession.create({
    data: {
      adminUserId,
      tokenHash,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function getAdminSessionByToken(token: string): Promise<AdminSessionRecord | null> {
  const tokenHash = hashSessionToken(token);
  const now = new Date();

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: {
      adminUser: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          passwordHash: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= now) {
    if (session) {
      await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => undefined);
    }
    return null;
  }

  const user = session.adminUser;
  if (!user.isActive || !user.passwordHash) {
    await revokeAdminSessionByToken(token);
    return null;
  }

  const sessionUser = toSessionUser(user);
  if (!sessionUser) {
    await revokeAdminSessionByToken(token);
    return null;
  }

  return {
    ...sessionUser,
    sessionId: session.id,
    expiresAt: session.expiresAt,
  };
}

export async function revokeAdminSessionByToken(token: string): Promise<void> {
  const tokenHash = hashSessionToken(token);
  await prisma.adminSession.deleteMany({ where: { tokenHash } });
}

export async function revokeAllAdminSessions(adminUserId: string): Promise<void> {
  await prisma.adminSession.deleteMany({ where: { adminUserId } });
}

export async function authenticateAdminCredentials(
  email: string,
  password: string,
  verifyPassword: (password: string, hash: string | null | undefined) => Promise<boolean>,
): Promise<AdminSessionUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return null;
  }

  const user = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      passwordHash: true,
    },
  });

  if (!user?.isActive || !user.passwordHash) {
    return null;
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    return null;
  }

  return toSessionUser(user);
}
