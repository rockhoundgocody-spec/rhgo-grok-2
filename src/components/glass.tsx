import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Glass({
  children,
  className,
  variant = "amethyst",
}: {
  children: ReactNode;
  className?: string;
  variant?: "amethyst" | "hud";
}) {
  return (
    <div className={cn(variant === "hud" ? "hud" : "glass", "relative overflow-hidden rounded-[22px]", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen"
        style={{
          background:
            variant === "hud"
              ? "radial-gradient(120% 80% at 50% -20%, hsla(195,100%,70%,0.22) 0%, transparent 62%)"
              : "radial-gradient(120% 80% at 38% -18%, hsla(280,100%,82%,0.20) 0%, transparent 62%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function HudCorners({ inset = 0 }: { inset?: number }) {
  const s = { top: inset, left: inset, right: inset, bottom: inset };
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden style={s}>
      <span className="hud-corner" style={{ top: 10, left: 10 }} />
      <span className="hud-corner rotate-90" style={{ top: 10, right: 10 }} />
      <span className="hud-corner rotate-180" style={{ bottom: 10, right: 10 }} />
      <span className="hud-corner -rotate-90" style={{ bottom: 10, left: 10 }} />
    </div>
  );
}

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("kicker", className)}>{children}</div>;
}