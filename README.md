# Findo

Finanzas familiares — cada quien ve las suyas, todos ven lo del hogar.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 — tokens de diseño en `src/app/globals.css` (paleta y tipografía Urbanist de la referencia)
- Supabase — autenticación (correo/contraseña) + Postgres con row-level security
- `motion` para animación, `recharts` para gráficas
- PWA (manifest en `public/manifest.json`)

## Cómo arrancar

1. **Instala dependencias** (yo no puedo correr `npm install` en este entorno, hazlo tú):
   ```
   npm install
   ```

2. **Crea un proyecto en [Supabase](https://supabase.com)** (gratis) y copia `.env.local.example` a `.env.local` con tus valores (Project Settings → API).

3. **Corre la migración inicial**: abre el SQL Editor de tu proyecto Supabase y pega el contenido de `supabase/migrations/0001_init.sql`, o usa el CLI de Supabase si lo tienes instalado:
   ```
   supabase db push
   ```

4. **Levanta el servidor**:
   ```
   npm run dev
   ```

5. Entra a `http://localhost:3000`, te va a mandar a `/login` — crea tu cuenta ahí. Ahora mismo el dashboard muestra datos de ejemplo (`src/lib/mockData.ts`); falta conectar las páginas a Supabase de verdad.

## Estado actual

- ✅ Autenticación (Supabase Auth) y esquema de base de datos con RLS (familias, miembros, tarjetas, movimientos, ahorros)
- ✅ Dashboard, Tarjetas — siguiendo tus capturas de referencia (Finpath), con datos de ejemplo
- ⏳ Movimientos, Ahorros — layout simple funcional, sin referencia de diseño todavía
- ⏳ Falta conectar cada pantalla a Supabase (hoy usan `mockData.ts`)
- ⏳ Falta la pantalla de Configuración/familia (invitar a tu papá)
- ⏳ Faltan íconos reales de PWA (`public/icon-*.png`)
