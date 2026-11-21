import type { Metadata } from "next";
import { AuthForm } from "@/src/features/auth/auth-form";
import { requireUser } from "@/src/features/auth/session";

export const metadata: Metadata = { title: "Keamanan Akun" };

export default async function SecurityPage() {
  await requireUser();
  return (
    <>
      <header className="page-heading"><h1>Keamanan akun</h1><p>Setelah kata sandi diganti, Anda perlu masuk kembali di semua perangkat.</p></header>
      <section className="portal-card settings-card" aria-label="Ubah kata sandi">
        <AuthForm mode="change" />
      </section>
    </>
  );
}
