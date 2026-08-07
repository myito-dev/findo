import { NavBar } from "@/components/NavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <NavBar />
      <main className="pb-[calc(env(safe-area-inset-bottom)+112px)] sm:pb-10">{children}</main>
    </div>
  );
}
