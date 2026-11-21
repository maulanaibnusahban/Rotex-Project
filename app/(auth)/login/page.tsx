import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPanel } from "@/src/components/layout/auth-panel";
import { AuthForm } from "@/src/features/auth/auth-form";
import { getSession, roleHome } from "@/src/features/auth/session";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const user = await getSession();
  if (user) redirect(roleHome[user.role]);

  const { notice } = await searchParams;
  return (
    <AuthPanel title="Masuk ke ROTEX" description="Gunakan email dan kata sandi akun Anda.">
      {notice === "password" && <p role="status" className="feedback feedback-success">Kata sandi diperbarui. Masuk dengan kata sandi baru.</p>}
      <AuthForm mode="login" />
      <p className="auth-links">Belum punya akun? <Link href="/register">Daftar sebagai pasien</Link></p>
    </AuthPanel>
  );
}
