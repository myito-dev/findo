"use client";

import { motion } from "motion/react";
import { useRef, useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions";
import { tapScaleSmall } from "@/lib/motion";

const inputClass = "w-full rounded-2xl border border-hairline bg-surface px-4 py-2.5 text-sm outline-none";

export function ProfileForm({ displayName, avatarUrl, email }: { displayName: string; avatarUrl: string | null; email: string }) {
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await updateProfile(formData);
        })
      }
      className="space-y-4"
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-uploaded Supabase Storage URL, not a static asset
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-lg font-bold text-ink-muted">
              {displayName.charAt(0).toUpperCase() || "?"}
            </span>
          )}
        </button>
        <div>
          <button type="button" onClick={() => fileRef.current?.click()} className="pill border border-hairline px-3 py-1.5 text-xs font-medium">
            Cambiar foto
          </button>
          <p className="mt-1 text-xs text-ink-muted">{email}</p>
        </div>
        <input ref={fileRef} type="file" name="avatar" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
      <input name="displayName" defaultValue={displayName} placeholder="Tu nombre" className={inputClass} />
      <motion.button
        type="submit"
        disabled={pending}
        whileTap={tapScaleSmall}
        className="pill w-full bg-accent py-2.5 text-sm font-semibold text-accent-ink disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar cambios"}
      </motion.button>
    </form>
  );
}
