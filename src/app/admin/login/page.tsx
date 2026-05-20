import { redirect } from "next/navigation";
import { signIn, auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/admin");
  const sp = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/admin",
    });
  }

  return (
    <div style={{ maxWidth: 360, margin: "32px auto" }} className="stack">
      <h1 className="page-title" style={{ marginBottom: 16 }}>Login Admin</h1>
      <form action={loginAction} className="stack" style={{ gap: 10 }}>
        <label className="field">
          <span>Username</span>
          <input name="username" required className="input" autoComplete="username" />
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" required className="input" autoComplete="current-password" />
        </label>
        {sp.error && (
          <div style={{ fontSize: 13, color: "var(--color-red-card)" }}>
            Login gagal. Periksa username dan password.
          </div>
        )}
        <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>
          Masuk
        </button>
      </form>
    </div>
  );
}
