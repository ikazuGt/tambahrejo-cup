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
            <svg width="22" height="22" viewBox="0 0 64 64" fill="currentColor">
              <path d="M32 6c-3 6-8 9-15 10 6 1 11 5 14 12-3-1-7-1-10 0 6 4 11 10 13 18-7-4-14-7-22-7 4 4 7 9 8 15-7-2-14-1-20 4 4 0 7 2 10 5-7 0-13 2-19 8 5 0 9 1 13 4-7 2-13 7-17 14 5-2 11-2 16 0-5 6-7 13-5 21 3-4 7-7 12-8-2 7 0 14 5 20 1-5 4-9 8-12 0 7 3 14 8 18 0-5 3-10 8-13 1 7 5 13 12 17-2-5-1-11 2-15 4 6 10 9 17 9-4-3-6-7-6-13 6 3 12 3 18 0-5 0-9-3-12-7 7 1 14 0 19-5-5 0-10-3-13-7 7-1 13-4 17-9-5 1-10 0-14-2 6-3 9-9 10-16-4 4-9 6-14 6 3-6 3-13 0-19-1 5-4 9-8 12 1-7-1-14-6-19 0 5-3 10-8 12-1-7-5-13-12-17 2 5 1 11-2 15-4-6-10-9-17-9 4 3 6 7 6 13-6-3-12-3-18 0 5 0 9 3 12 7-7-1-14 0-19 5 5 0 10 3 13 7-7 1-13 4-17 9 5-1 10 0 14 2-6 3-9 9-10 16 4-4 9-6 14-6-1 6-1 12 1 17z"/>
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
