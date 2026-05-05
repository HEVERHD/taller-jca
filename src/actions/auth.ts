"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME   = "jca_session";
const REMEMBER_NAME = "jca_remember";
const MAX_AGE_SHORT = 60 * 60 * 24 * 7;  // 7 días (sin recordar)
const MAX_AGE_LONG  = 60 * 60 * 24 * 30; // 30 días (recordar)

export async function loginAction(formData: FormData) {
  const username = formData.get("username")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const remember = formData.get("remember") === "on";

  const validUser = process.env.APP_USERNAME!;
  const validPass = process.env.APP_PASSWORD!;
  const secret    = process.env.SESSION_SECRET!;

  if (username !== validUser || password !== validPass) {
    return { error: "Usuario o contraseña incorrectos" };
  }

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: remember ? MAX_AGE_LONG : MAX_AGE_SHORT,
    path: "/",
  });

  if (remember) {
    cookieStore.set(REMEMBER_NAME, username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE_LONG,
      path: "/",
    });
  } else {
    cookieStore.delete(REMEMBER_NAME);
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}
