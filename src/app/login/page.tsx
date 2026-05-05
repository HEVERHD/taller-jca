import { cookies } from "next/headers";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const savedUsername = cookieStore.get("jca_remember")?.value ?? "";

  return <LoginForm defaultUsername={savedUsername} />;
}
