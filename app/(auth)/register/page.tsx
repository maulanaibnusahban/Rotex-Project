import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPanel } from "@/src/components/layout/auth-panel";
import { AuthForm } from "@/src/features/auth/auth-form";
import { getSession, roleHome } from "@/src/features/auth/session";

export const metadata: Metadata = { title: "Daftar sebagai Pasien" };

export default async function RegisterPage() {
  const user = await getSession();
  if (user) redirect(roleHome[user.role]);

  return (
    <AuthPanel title="Daftar sebagai pasien" description="Lengkapi data untuk membuat akun dan membuka dashboard pasien.">
      <AuthForm mode="register" />
      <p className="auth-links">Sudah punya akun? <Link href="/login">Masuk</Link></p>
    </AuthPanel>
  );
}
