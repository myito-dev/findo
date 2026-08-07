"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, CardIcon, ExchangeIcon, HomeIcon, PiggyBankIcon, SettingsIcon } from "./icons";

const springSnappy = { type: "spring" as const, duration: 0.25, bounce: 0.05 };

const LINKS = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/movimientos", label: "Movimientos", icon: ExchangeIcon },
  { href: "/tarjetas", label: "Tarjetas", icon: CardIcon },
  { href: "/ahorros", label: "Ahorros", icon: PiggyBankIcon },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2l3 7h7l-5.5 4.2L18.5 22 12 17.5 5.5 22l2-8.8L2 9h7z" />
        </svg>
      </span>
      <span className="text-[15px] font-bold tracking-tight">Findo</span>
    </Link>
  );
}

export function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top bar */}
      <header className="sticky top-0 z-40 hidden border-b border-hairline bg-page/80 backdrop-blur-md sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Logo />
          <nav className="flex items-center gap-1 rounded-full border border-hairline bg-surface p-1">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className="relative rounded-full px-4 py-1.5 text-sm font-medium">
                  {active && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-accent" transition={springSnappy} />
                  )}
                  <span className={`relative z-10 ${active ? "text-accent-ink" : "text-ink-secondary"}`}>{link.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Notificaciones" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink-secondary">
              <BellIcon className="h-4 w-4" />
            </button>
            <Link href="/configuracion" aria-label="Configuración" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink-secondary">
              <SettingsIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-hairline bg-page/80 px-4 py-3 backdrop-blur-md [transform:translateZ(0)] sm:hidden">
        <Logo />
        <button type="button" aria-label="Notificaciones" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink-secondary">
          <BellIcon className="h-4 w-4" />
        </button>
      </header>

      {/* Mobile floating bottom nav — only the active tab shows a label,
          matching the reference's compact pill pattern. */}
      <nav
        className="fixed inset-x-4 z-40 rounded-[28px] border border-hairline bg-surface/90 px-2 backdrop-blur-md [transform:translateZ(0)] sm:hidden"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
      >
        <div className="flex items-center justify-around py-2">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="relative flex items-center">
                {active ? (
                  <motion.span layoutId="nav-pill-mobile" className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-accent-ink" transition={springSnappy}>
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-semibold">{link.label}</span>
                  </motion.span>
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted">
                    <Icon className="h-4 w-4" />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
