import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  // Bereits angemeldet -> direkt ins Panel.
  if (await isAuthenticated()) redirect("/admin");

  return (
    <div className="login-screen">
      <LoginForm />
    </div>
  );
}
