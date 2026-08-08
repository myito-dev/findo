"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SettingsIcon, UsersIcon } from "./icons";
import { MotionLink } from "./MotionLink";
import { signOut } from "@/lib/actions";
import { springSnappy, tapScaleSmall } from "@/lib/motion";

export interface AccountInfo {
  displayName: string;
  avatarUrl: string | null;
  familyName: string | null;
}

/** Avatar trigger next to the alerts bell — opens a menu with Perfil,
 * Familia and Cerrar sesión. Doubles as the mobile entry point to account
 * settings, since the mobile top bar has no room for a separate gear icon. */
export function AccountMenu({ displayName, avatarUrl, familyName }: AccountInfo) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initial = displayName.charAt(0).toUpperCase() || "?";

  return (
    <div className="relative" ref={ref}>
      <motion.button
        type="button"
        aria-label="Cuenta"
        onClick={() => setOpen((o) => !o)}
        whileTap={tapScaleSmall}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-surface text-sm font-bold text-ink-secondary"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded Supabase Storage URL
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={springSnappy}
            style={{ transformOrigin: "top right" }}
            className="card absolute right-0 top-11 z-50 w-60 !p-2 shadow-xl"
          >
            <div className="flex items-center gap-3 px-2 py-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface text-sm font-bold text-ink-secondary">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{displayName || "Sin nombre"}</p>
                <p className="truncate text-xs text-ink-muted">{familyName ?? "Sin familia"}</p>
              </div>
            </div>

            <div className="my-1 h-px bg-hairline" />

            <MotionLink
              href="/perfil"
              onClick={() => setOpen(false)}
              whileTap={tapScaleSmall}
              className="flex items-center gap-2.5 rounded-2xl px-2 py-2 text-sm font-medium"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink-secondary">
                <SettingsIcon className="h-3.5 w-3.5" />
              </span>
              Perfil
            </MotionLink>
            <MotionLink
              href="/configuracion"
              onClick={() => setOpen(false)}
              whileTap={tapScaleSmall}
              className="flex items-center gap-2.5 rounded-2xl px-2 py-2 text-sm font-medium"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink-secondary">
                <UsersIcon className="h-3.5 w-3.5" />
              </span>
              Familia
            </MotionLink>

            <div className="my-1 h-px bg-hairline" />

            <form action={signOut}>
              <button type="submit" className="w-full rounded-2xl px-2 py-2 text-left text-sm font-medium text-negative">
                Cerrar sesión
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
