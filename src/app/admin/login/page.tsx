import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
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
    try {
      await signIn("credentials", {
        username,
        password,
        redirectTo: "/admin",
      });
    } catch (err) {
      // Successful sign-in throws a redirect — re-throw it so Next can handle it.
      if (isRedirectError(err)) throw err;
      if (err instanceof AuthError) {
        const code =
          err.type === "CredentialsSignin" ? "CredentialsSignin" : "Unknown";
        redirect(`/admin/login?error=${code}`);
      }
      redirect("/admin/login?error=Unknown");
    }
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
          <div
            role="alert"
            style={{
              padding: "10px 12px",
              border: "1px solid var(--color-red-card, #dc2626)",
              borderRadius: 8,
              background: "rgba(220, 38, 38, 0.08)",
              color: "var(--color-red-card, #dc2626)",
              fontSize: 13.5,
            }}
          >
            {sp.error === "CredentialsSignin"
              ? "Username atau password salah. Silakan coba lagi."
              : "Gagal masuk. Silakan coba lagi."}
          </div>
        )}
        <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>
          Masuk
        </button>
      </form>
    </div>
  );
}
