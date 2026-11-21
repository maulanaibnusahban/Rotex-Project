"use client";

import { useRef, type KeyboardEvent } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import "./public-navigation.css";

const navigation = [
  ["Beranda", "beranda"],
  ["Tentang ROTEX", "tentang"],
  ["Fitur", "fitur"],
  ["Cara Kerja", "cara-kerja"],
  ["Tim Pengembang", "tim"],
] as const;

export function PublicNavigation() {
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const toggle = useRef<HTMLElement>(null);

  function closeMenu() {
    if (mobileMenu.current) mobileMenu.current.open = false;
  }

  function handleMenuKey(event: KeyboardEvent<HTMLDetailsElement>) {
    if (event.key !== "Escape" || !event.currentTarget.open) return;
    event.preventDefault();
    closeMenu();
    toggle.current?.focus();
  }

  return (
    <>
      <nav aria-label="Navigasi utama" className="public-nav">
        {navigation.map(([label, id]) => (
          <a key={id} className="public-section-link" href={`/#${id}`}>
            {label}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <Link className="button public-login" href="/login">
          Masuk
        </Link>
        <Link className="button button-primary" href="/register">
          Daftar Pasien
        </Link>
      </div>
      <details ref={mobileMenu} className="public-menu" onKeyDown={handleMenuKey}>
        <summary ref={toggle} className="button button-secondary">
          <Menu className="public-menu-open" size={19} aria-hidden="true" />
          <X className="public-menu-close" size={19} aria-hidden="true" />
          Menu
        </summary>
        <div className="public-menu-panel">
          <nav aria-label="Navigasi utama mobile">
            {navigation.map(([label, id]) => (
              <a key={id} className="public-section-link" href={`/#${id}`} onClick={closeMenu}>
                {label}
              </a>
            ))}
          </nav>
          <div className="public-menu-actions">
            <Link className="button public-login" href="/login" onClick={closeMenu}>
              Masuk
            </Link>
            <Link className="button button-primary" href="/register" onClick={closeMenu}>
              Daftar Pasien
            </Link>
          </div>
        </div>
      </details>
    </>
  );
}
