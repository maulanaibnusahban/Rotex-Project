"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  History,
  LayoutDashboard,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UserRoundCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Role } from "@prisma/client";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

function getNavigationGroups(role: Role, home: string): NavGroup[] {
  if (role === Role.ADMIN) {
    return [
      {
        title: "Ikhtisar",
        items: [{ label: "Ringkasan Utama", href: home, icon: LayoutDashboard }],
      },
      {
        title: "Manajemen Pengguna",
        items: [
          { label: "Data Dokter", href: `${home}/doctors`, icon: Stethoscope },
          { label: "Data Pasien", href: `${home}/patients`, icon: UsersRound },
          { label: "Penugasan Dokter", href: `${home}/assignments`, icon: UserRoundCheck },
        ],
      },
      {
        title: "Operasional & Sistem",
        items: [
          { label: "Kalender Terapi", href: `${home}/appointments`, icon: CalendarDays },
          { label: "Log Aktivitas", href: `${home}/audit`, icon: History },
        ],
      },
      {
        title: "Pengaturan",
        items: [{ label: "Keamanan Akun", href: "/account/security", icon: ShieldCheck }],
      },
    ];
  }

  if (role === Role.DOCTOR) {
    return [
      {
        title: "Ikhtisar",
        items: [{ label: "Ringkasan Praktik", href: home, icon: LayoutDashboard }],
      },
      {
        title: "Pelayanan Pasien",
        items: [
          { label: "Pasien Ditugaskan", href: `${home}/patients`, icon: UsersRound },
          { label: "Agenda & Kalender", href: `${home}/appointments`, icon: CalendarDays },
          { label: "Jurnal Terapi & ROM", href: `${home}/journals`, icon: ClipboardList },
        ],
      },
      {
        title: "Pengaturan",
        items: [{ label: "Keamanan Akun", href: "/account/security", icon: ShieldCheck }],
      },
    ];
  }

  // PATIENT
  return [
    {
      title: "Ikhtisar",
      items: [{ label: "Beranda Pasien", href: home, icon: LayoutDashboard }],
    },
    {
      title: "Rehabilitasi Saya",
      items: [
        { label: "Jadwal Terapi", href: `${home}/appointments`, icon: CalendarDays },
        { label: "Riwayat Jurnal", href: `${home}/history`, icon: ClipboardList },
        { label: "Perkembangan ROM", href: `${home}/progress`, icon: Activity },
      ],
    },
    {
      title: "Akun Saya",
      items: [
        { label: "Profil Pasien", href: "/patient/profile", icon: UserRound },
        { label: "Keamanan Akun", href: "/account/security", icon: ShieldCheck },
      ],
    },
  ];
}

export function PortalNavigation({
  role,
  dashboardHome,
}: {
  role: Role;
  dashboardHome: string;
}) {
  const pathname = usePathname();
  const groups = getNavigationGroups(role, dashboardHome);

  return (
    <nav className="portal-nav-grouped" aria-label="Navigasi dashboard">
      {groups.map((group) => (
        <div key={group.title} className="nav-group">
          <span className="nav-group-title">{group.title}</span>
          <div className="nav-group-items">
            {group.items.map(({ label, href, icon: Icon }) => {
              const isActive =
                href === dashboardHome
                  ? pathname === dashboardHome
                  : pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-item-link ${isActive ? "is-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="nav-item-icon" size={16} aria-hidden="true" />
                  <span className="nav-item-label">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
