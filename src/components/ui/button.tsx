import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium select-none disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hud/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.96] transition-[transform,background-color,opacity,box-shadow] duration-150 ease-out",
  {
    variants: {
      variant: {
        primary:
          "bg-mint text-mint-fg rounded-[16px] font-semibold shadow-[0_0_40px_-8px_rgba(159,232,208,0.5)]",
        ghost: "bg-transparent text-fg rounded-[12px] hover:bg-elevated/60",
        outline: "glass text-fg rounded-[14px]",
        subtle: "glass text-fg rounded-[14px]",
        danger: "bg-danger/15 text-danger rounded-[12px]",
      },
      size: {
        sm: "h-9 px-3 text-xs tracking-wide",
        md: "h-11 px-4 text-sm",
        lg: "h-14 px-8 text-sm tracking-[0.16em] uppercase",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
