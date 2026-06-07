import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import {
  authenticateAdminCredentials,
  buildAdminSessionCookie,
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false as const, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false as const, message: "Invalid email or password" },
      { status: 400 },
    );
  }

  const user = await authenticateAdminCredentials(
    parsed.data.email,
    parsed.data.password,
    verifyAdminPassword,
  );

  if (!user) {
    return NextResponse.json(
      { success: false as const, message: "Invalid email or password" },
      { status: 401 },
    );
  }

  const { token } = await createAdminSession(user.id);
  const cookie = buildAdminSessionCookie(token);
  const cookieStore = await cookies();
  cookieStore.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });

  return NextResponse.json({
    success: true as const,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
