import type { AdminRole } from "@/generated/prisma/index";

export type AdminSessionUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

export type AdminSessionRecord = AdminSessionUser & {
  sessionId: string;
  expiresAt: Date;
};
