import { cn } from "@/lib/utils";
import { HudCorners } from "@/components/glass";

export function ScanReticle({
  state = "idle",
  className,
}: {
  state?: "idle" | "live" | "locked";
  className?: string;
}) {
  const ring =
    state === "locked"
      ? "border-good/70"
      : state === "live"
        ? "border-hud/70"
        : "border-white/25";

  return (
    <div className={cn("relative h-[260px] w-full overflow-hidden rounded-[24px] bg-black/55", className)}>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(hsla(195,100%,60%,0.09) 1px, transparent 1px), linear-gradient(90deg, hsla(195,100%,60%,0.09) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 42%, hsla(250,40%,4%,0.55) 100%)",
        }}
      />
      <HudCorners />
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative size-[176px]">
          <div className={cn("absolute inset-0 rounded-full border", ring)} />
          <div
            className={cn(
              "absolute inset-3 rounded-full border border-dashed animate-spin-slow",
              state === "locked" ? "border-good/50" : "border-hud/40",
            )}
          />
          <div className="absolute inset-[44px] rounded-full border border-hud/20" />
          <span className="absolute left-1/2 top-0 h-2.5 w-px -translate-x-1/2 bg-hud/80" />
          <span className="absolute bottom-0 left-1/2 h-2.5 w-px -translate-x-1/2 bg-hud/80" />
          <span className="absolute left-0 top-1/2 h-px w-2.5 -translate-y-1/2 bg-hud/80" />
          <span className="absolute right-0 top-1/2 h-px w-2.5 -translate-y-1/2 bg-hud/80" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-8 top-0 h-1/2 overflow-hidden">
        <div className="h-8 w-full bg-gradient-to-b from-transparent via-hud/40 to-transparent animate-hud-scan" />
      </div>
    </div>
  );
}