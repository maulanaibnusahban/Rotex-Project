import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { Role } from "@prisma/client";
import { Brand } from "@/src/components/layout/brand";
import { logout } from "@/src/features/auth/actions";
import { requireUser, roleHome, roleLabel } from "@/src/features/auth/session";
import { DashboardMobileMenu } from "@/src/features/dashboard/mobile-menu";
import { PortalNavigation } from "@/src/features/dashboard/portal-navigation";
import "@/src/features/dashboard/dashboard.css";
import "@/src/features/rehab/workspace.css";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const roleBadgeClass: Record<Role, string> = {
  [Role.ADMIN]: "role-badge-admin",
  [Role.DOCTOR]: "role-badge-doctor",
  [Role.PATIENT]: "role-badge-patient",
};

function UserProfileWidget({
  user,
}: {
  user: { name: string; email: string; role: Role };
}) {
  const cleanName = user.name.replace(/^dr\.\s*/i, "").trim();
  const initial = (cleanName ? cleanName.charAt(0) : user.name.charAt(0)).toUpperCase();

  return (
    <div className="sidebar-user-card">
      <span className="sidebar-user-avatar" aria-hidden="true">
        {initial}
      </span>
      <div className="sidebar-user-info">
        <div className="sidebar-user-name-row">
          <strong className="sidebar-user-name" title={user.name}>
            {user.name}
          </strong>
          <span className={`role-badge-mini ${roleBadgeClass[user.role]}`}>
            {roleLabel[user.role]}
          </span>
        </div>
        <span className="sidebar-user-email" title={user.email}>
          {user.email}
        </span>
      </div>
      <form action={logout} className="sidebar-logout-form">
        <button
          className="sidebar-logout-btn"
          type="submit"
          title="Keluar dari akun"
          aria-label="Keluar dari akun"
        >
          <LogOut size={16} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

export default async function PortalLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const dashboard = roleHome[user.role];

  return (
    <div className="portal-layout workspace-shell">
      <aside className="portal-sidebar">
        <div className="workspace-sidebar-bar">
          <Brand />
          <DashboardMobileMenu>
            <div className="mobile-drawer-content">
              <PortalNavigation role={user.role} dashboardHome={dashboard} />
              <div className="mobile-drawer-user">
                <UserProfileWidget user={user} />
              </div>
            </div>
          </DashboardMobileMenu>
        </div>

        <div className="workspace-desktop-links">
          <PortalNavigation role={user.role} dashboardHome={dashboard} />
        </div>

        <div className="sidebar-user-footer">
          <UserProfileWidget user={user} />
        </div>
      </aside>

      <div className="portal-body">
        <main className="portal-main" id="konten">
          {children}
        </main>
      </div>
    </div>
  );
}
