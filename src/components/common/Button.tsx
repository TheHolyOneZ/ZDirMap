import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "subtle" | "danger";
  size?: "sm" | "md";
  icon?: ReactNode;
}

export default function Button({
  variant = "ghost",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: Props) {
  const base = "inline-flex items-center justify-center gap-1.5 font-medium transition-all cursor-default select-none disabled:opacity-40 disabled:cursor-not-allowed";
  const sizing = size === "sm" ? "h-7 px-2.5 text-[11px] rounded-lg" : "h-9 px-3.5 text-[12px] rounded-xl";
  const palette = {
    primary: "text-white",
    ghost: "",
    subtle: "",
    danger: "",
  }[variant];
  const styleVar = (() => {
    switch (variant) {
      case "primary":
        return {
          background: "linear-gradient(135deg, var(--color-accent-3), var(--color-accent))",
          boxShadow: "0 6px 18px -8px var(--color-cyan-glow)",
        } as const;
      case "subtle":
        return {
          background: "var(--color-panel)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
        } as const;
      case "danger":
        return {
          background: "rgba(248,113,113,0.12)",
          border: "1px solid rgba(248,113,113,0.25)",
          color: "#fca5a5",
        } as const;
      default:
        return {
          color: "var(--color-text-muted)",
        } as const;
    }
  })();

  return (
    <button
      className={clsx(base, sizing, palette, className)}
      style={styleVar}
      onMouseEnter={(e) => {
        if (variant === "ghost") {
          e.currentTarget.style.background = "var(--color-panel-hover)";
          e.currentTarget.style.color = "var(--color-text)";
        }
      }}
      onMouseLeave={(e) => {
        if (variant === "ghost") {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--color-text-muted)";
        }
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
