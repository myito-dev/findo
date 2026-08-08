import { MotionLink } from "./MotionLink";
import { Card } from "./ui/Card";

/** Shown on any data page when the signed-in user hasn't created or joined
 * a family yet — cards/movimientos/ahorros all need a family_id to write to. */
export function NoFamilyPrompt() {
  return (
    <Card>
      <p className="text-sm font-semibold">Todavía no tienes una familia</p>
      <p className="mt-1 text-sm text-ink-secondary">Crea una familia o únete con un código para empezar a registrar tus finanzas.</p>
      <MotionLink
        href="/configuracion"
        whileTap={{ scale: 0.97 }}
        className="pill mt-4 inline-flex bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink"
      >
        Ir a Configuración
      </MotionLink>
    </Card>
  );
}
