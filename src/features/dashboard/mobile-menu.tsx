"use client";

import { useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { Menu } from "lucide-react";

export function DashboardMobileMenu({ children }: { children: ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const toggle = useRef<HTMLElement>(null);

  function closeOnLink(event: MouseEvent<HTMLDivElement>) {
    if (menu.current && event.target instanceof Element && event.target.closest("a")) menu.current.open = false;
  }

  function closeOnEscape(event: KeyboardEvent<HTMLDetailsElement>) {
    if (event.key !== "Escape" || !event.currentTarget.open) return;
    event.preventDefault();
    event.currentTarget.open = false;
    toggle.current?.focus();
  }

  return (
    <details ref={menu} className="workspace-mobile-menu" onKeyDown={closeOnEscape}>
      <summary ref={toggle} className="button button-secondary"><Menu size={18} aria-hidden="true" /> Menu</summary>
      <div className="workspace-mobile-links" onClick={closeOnLink}>{children}</div>
    </details>
  );
}
