import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Design-skill packages (npx skills add), if installed into this project — not app code.
    ".agents/**",
    ".claude/**",
    // bklit chart system, vendored from garmin-coach — vendor code we consume, not
    // author; our own wrapper charts (CashflowChart.tsx) stay PascalCase and are
    // still linted.
    "src/components/charts/[a-z]*.{ts,tsx}",
    "src/components/charts/tooltip/**",
    "src/components/shimmering-text.tsx",
  ]),
]);

export default eslintConfig;
