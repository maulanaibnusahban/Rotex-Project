import type { Metadata } from "next";
import { Role } from "@prisma/client";
import { AuthForm } from "@/src/features/auth/auth-form";
import { requireUser } from "@/src/features/auth/session";

export const metadata: Metadata = { title: "Profil Saya" };

export default async function ProfilePage() {
  const patient = await requireUser(Role.PATIENT);
  return (
    <>
      <header className="page-heading"><h1>Profil saya</h1><p>Kelola informasi dasar akun pasien Anda.</p></header>
      <section className="portal-card settings-card" aria-label="Informasi akun">
        <dl className="account-details"><div><dt>Alamat email</dt><dd>{patient.email}</dd></div></dl>
        <AuthForm mode="profile" initialName={patient.name} />
      </section>
    </>
  );
}
