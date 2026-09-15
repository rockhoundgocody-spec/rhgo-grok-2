import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Gauge, Gem, Home, Map, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Atmosphere } from "@/components/atmosphere";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/field", label: "Field", icon: Map },
  { to: "/scan", label: "Scan", icon: ScanLine, hero: true },
  { to: "/dex", label: "Geo-DEX", icon: Gem },
  { to: "/bench", label: "Bench", icon: Gauge },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative flex h-dvh flex-col text-fg">
      <Atmosphere />
      <div
        className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain"
        style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}
      >
        {children}
      </div>
      <nav className="crystal-nav" aria-label="Primary">
        {TABS.map((tab) => {
          const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
          if ("hero" in tab && tab.hero) {
            return (
              <div key={tab.to} className="-mt-7 flex flex-col items-center gap-1 px-1">
                <div className="relative">
                  <span className="scan-orbit" />
                  <Link to={tab.to} className="crystal-scan" aria-label="Scan" aria-current={active ? "page" : undefined}>
                    <ScanLine size={24} strokeWidth={1.75} />
                  </Link>
                </div>
                <span
                  className="text-[8px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: active ? "hsla(190,100%,85%,0.9)" : "hsla(255,15%,60%,0.5)" }}
                >
                  Scan
                </span>
              </div>
            );
          }
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? "page" : undefined}
              aria-label={tab.label}
              className="crystal-tab"
            >
              <Icon size={19} strokeWidth={active ? 2 : 1.6} aria-hidden />
              {tab.label}
              {active ? (
                <span
                  className="absolute bottom-1 size-1 rounded-full"
                  style={{ background: "hsl(195,100%,70%)", boxShadow: "0 0 8px hsla(195,100%,65%,0.8)" }}
                />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function TopBar({
  kicker,
  title,
  right,
}: {
  kicker?: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <header
      className="flex items-end justify-between gap-3 px-5 pb-3"
      style={{ paddingTop: "max(20px, env(safe-area-inset-top))" }}
    >
      <div>
        {kicker ? <div className="kicker mb-1">{kicker}</div> : null}
        <h1 className="display text-[28px] leading-none text-fg">{title}</h1>
      </div>
      {right}
    </header>
  );
}