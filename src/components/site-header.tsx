"use client";

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
          <span className="brand-mark" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 100 100" fill="currentColor">
              {/* Garuda — head with crown, body, spread wings */}
              <path d="M50 12 L52 6 L58 8 L56 14 L62 12 L60 18 L66 16 L62 22 Q70 22 74 28 L82 30 L78 36 L86 36 L80 42 L88 44 L80 48 L86 54 L78 54 L82 62 L74 60 Q72 70 64 74 L74 80 L64 80 L70 88 L58 84 L60 92 L50 86 L40 92 L42 84 L30 88 L36 80 L26 80 L36 74 Q28 70 26 60 L18 62 L22 54 L14 54 L20 48 L12 44 L20 42 L14 36 L22 36 L18 30 L26 28 Q30 22 38 22 L34 16 L40 18 L38 12 L44 14 L42 8 L48 6 Z M50 30 Q42 32 38 40 L42 46 L38 50 L46 54 Q50 60 50 66 Q50 60 54 54 L62 50 L58 46 L62 40 Q58 32 50 30 Z"/>
            </svg>
          </span>
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
