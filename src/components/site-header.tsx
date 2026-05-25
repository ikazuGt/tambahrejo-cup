"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/jadwal", label: "Jadwal" },
  { href: "/hasil", label: "Hasil" },
  { href: "/bracket", label: "Bracket" },
  { href: "/tim", label: "Tim" },
  { href: "/statistik", label: "Statistik" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="site-header">
      <div className="flag-stripe" aria-hidden />
      <div className="container-page header-row">
        <a href="/" className="brand">
          <Image
            src="/logo.png"
            alt="Tambahrejo Cup"
            width={60}
            height={60}
            className="brand-logo"
            priority
          />
          <span>TAMBAHREJO <span className="accent">CUP</span></span>
        </a>
        <nav className="nav" aria-label="Navigasi utama">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="nav-link"
              data-active={isActive(n.href)}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <a
          href="/admin"
          className="nav-link admin-link"
          data-active={pathname.startsWith("/admin")}
          aria-label="Panel admin"
          title="Panel admin"
        >
          🔒
        </a>
      </div>
    </header>
  );
}
