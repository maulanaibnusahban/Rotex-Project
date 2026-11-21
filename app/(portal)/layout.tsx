import type { Metadata } from "next";
import Link from "next/link";
import { Activity, CalendarDays, ClipboardList, History, LayoutDashboard, LogOut, ShieldCheck, Stethoscope, UserRound, UserRoundCheck, UsersRound } from "lucide-react";
import { Role } from "@prisma/client";
import { Brand } from "@/src/components/layout/brand";
import { logout } from "@/src/features/auth/actions";
import { requireUser, roleHome, roleLabel } from "@/src/features/auth/session";
import { DashboardMobileMenu } from "@/src/features/dashboard/mobile-menu";
import "@/src/features/dashboard/dashboard.css";
import "@/src/features/rehab/workspace.css";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const dashboardLinks = {
  [Role.ADMIN]: [["Manajemen dokter", "doctors", Stethoscope], ["Manajemen pasien", "patients", UsersRound],
    ["Penugasan", "assignments", UserRoundCheck], ["Kalender terapi", "appointments", CalendarDays], ["Aktivitas", "audit", History]],
  [Role.DOCTOR]: [["Pasien saya", "patients", UsersRound], ["Kalender terapi", "appointments", CalendarDays], ["Jurnal terapi", "journals", ClipboardList]],
  [Role.PATIENT]: [["Jadwal terapi", "appointments", CalendarDays], ["Riwayat terapi", "history", ClipboardList], ["Perkembangan ROM", "progress", Activity]],
} as const;

export default async function PortalLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const dashboard = roleHome[user.role];
  const navigation = (
    <nav aria-label="Navigasi dashboard">
      <Link href={dashboard}><LayoutDashboard size={19} aria-hidden="true" /> Ringkasan</Link>
      {dashboardLinks[user.role].map(([label, route, Icon]) => (
        <Link key={route} href={dashboard + "/" + route}><Icon size={19} aria-hidden="true" /> {label}</Link>
      ))}
      {user.role === Role.PATIENT && <Link href="/patient/profile"><UserRound size={19} aria-hidden="true" /> Profil Saya</Link>}
      <Link href="/account/security"><ShieldCheck size={19} aria-hidden="true" /> Keamanan Akun</Link>
    </nav>
  );

  return (
    <div className="portal-layout workspace-shell">
      <aside className="portal-sidebar">
        <div className="workspace-sidebar-bar"><Brand /><DashboardMobileMenu>{navigation}</DashboardMobileMenu></div>
        <div className="workspace-desktop-links">{navigation}</div>
      </aside>
      <div className="portal-body">
        <header className="portal-header">
          <div className="workspace-identity">
            <span className="workspace-avatar"><UserRound size={18} aria-hidden="true" /></span>
            <div><strong>{user.name}</strong><span>{roleLabel[user.role]}</span></div>
          </div>
          <form action={logout}>
            <button className="button button-secondary" type="submit"><LogOut size={17} aria-hidden="true" /> Keluar</button>
          </form>
        </header>
        <main className="portal-main" id="konten">{children}</main>
      </div>
    </div>
  );
}
