export type CardNetwork = "visa" | "mastercard" | "amex";

export interface BankBrand {
  gradient: string;
  ink: string;
}

// Common Mexican/Latam issuers, matched against the free-text card name the
// user types (e.g. "Nu Mastercard", "BBVA Débito"). Unrecognized names fall
// back to the app's plain card style — no invented brand.
const BANKS: { pattern: RegExp; brand: BankBrand }[] = [
  { pattern: /\bnu\b/i, brand: { gradient: "linear-gradient(135deg, #9c3ff0, #4c0a8f)", ink: "#ffffff" } },
  { pattern: /bbva/i, brand: { gradient: "linear-gradient(135deg, #1c6dd0, #071c3d)", ink: "#ffffff" } },
  { pattern: /santander/i, brand: { gradient: "linear-gradient(135deg, #ff2d2d, #7a0000)", ink: "#ffffff" } },
  { pattern: /banamex|citibanamex/i, brand: { gradient: "linear-gradient(135deg, #1f4fa3, #001433)", ink: "#ffffff" } },
  { pattern: /hsbc/i, brand: { gradient: "linear-gradient(135deg, #e2001a, #6b000e)", ink: "#ffffff" } },
  { pattern: /banorte/i, brand: { gradient: "linear-gradient(135deg, #e2001a, #5c0000)", ink: "#ffffff" } },
  { pattern: /scotiabank/i, brand: { gradient: "linear-gradient(135deg, #ec111a, #6b0000)", ink: "#ffffff" } },
  { pattern: /inbursa/i, brand: { gradient: "linear-gradient(135deg, #0057b8, #00294d)", ink: "#ffffff" } },
  { pattern: /amex|american express/i, brand: { gradient: "linear-gradient(135deg, #d9b98a, #7a5a2e)", ink: "#2b1d05" } },
];

export function detectBankBrand(name: string): BankBrand | null {
  for (const { pattern, brand } of BANKS) {
    if (pattern.test(name)) return brand;
  }
  return null;
}

export function detectNetwork(name: string): CardNetwork | null {
  if (/mastercard|master\s?card/i.test(name)) return "mastercard";
  if (/\bvisa\b/i.test(name)) return "visa";
  if (/amex|american express/i.test(name)) return "amex";
  return null;
}
