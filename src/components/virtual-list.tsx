import { useMemo, useRef, useState, type ReactNode, type UIEvent } from "react";

type Props<T> = {
  items: T[];
  rowHeight: number;
  overscan?: number;
  className?: string;
  render: (item: T, index: number) => ReactNode;
  getKey: (item: T, index: number) => string;
};

export function VirtualList<T>({ items, rowHeight, overscan = 8, className, render, getKey }: Props<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0);
  const [height, setHeight] = useState(640);

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    setScroll(e.currentTarget.scrollTop);
    const h = e.currentTarget.clientHeight;
    if (h && h !== height) setHeight(h);
  };

  const start = Math.max(0, Math.floor(scroll / rowHeight) - overscan);
  const end = Math.min(items.length, Math.ceil((scroll + height) / rowHeight) + overscan);
  const slice = useMemo(() => items.slice(start, end), [items, start, end]);

  return (
    <div ref={ref} onScroll={onScroll} className={className} style={{ contentVisibility: "auto" }}>
      <div style={{ height: items.length * rowHeight, position: "relative" }}>
        {slice.map((item, i) => {
          const index = start + i;
          return (
            <div
              key={getKey(item, index)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: rowHeight,
                transform: `translateY(${index * rowHeight}px)`,
                contain: "layout paint",
              }}
            >
              {render(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
