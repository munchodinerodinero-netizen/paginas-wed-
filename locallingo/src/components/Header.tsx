import Link from "next/link";
import { brand } from "@/config/brand";
import type { SessionUser } from "@/server/auth";
import type { TFunction } from "@/i18n/core";
import { Preferences } from "./Preferences";
import { LogoutButton } from "./LogoutButton";

export function Header({ user, t }: { user: SessionUser | null; t: TFunction }) {
  const links = [
    { href: "/explorar", label: t("nav.explore") },
    { href: "/#como-funciona", label: t("nav.howItWorks") },
    { href: "/ser-guia", label: t("nav.becomeGuide") },
    { href: "/ayuda", label: t("nav.help") },
  ];
  const userLinks = user
    ? [
        { href: "/panel", label: t("nav.dashboard") },
        { href: "/mensajes", label: t("nav.messages") },
        ...(user.role === "ADMIN" ? [{ href: "/admin", label: t("nav.admin") }] : []),
      ]
    : [];
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          <span className="logo-mark">{brand.logoMark}</span>
          {brand.name}
        </Link>
        <nav className="nav" aria-label="Principal">
          {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        </nav>
        <div className="header-actions">
          <Preferences />
          {!user && (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm hide-mobile">{t("nav.login")}</Link>
              <Link href="/registro" className="btn btn-primary btn-sm hide-mobile">{t("nav.register")}</Link>
            </>
          )}
          <details className="menu-mobile">
            <summary aria-label="Menú">☰</summary>
            <div className="menu-panel">
              {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
              {userLinks.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
              {user ? <LogoutButton /> : (
                <>
                  <Link href="/login">{t("nav.login")}</Link>
                  <Link href="/registro">{t("nav.register")}</Link>
                </>
              )}
            </div>
          </details>
          {user && (
            <details className="user-menu hide-mobile">
              <summary className="btn btn-outline btn-sm">👤 {user.name.split(" ")[0]} ▾</summary>
              <div className="menu-panel">
                <span className="muted small" style={{ padding: "8px 12px" }}>{user.email}</span>
                {userLinks.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
                <LogoutButton />
              </div>
            </details>
          )}
        </div>
      </div>
    </header>
  );
}
