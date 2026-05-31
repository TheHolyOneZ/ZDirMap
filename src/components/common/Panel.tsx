import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  pad?: boolean;
}

export default function Panel({ children, pad = true, className, ...rest }: Props) {
  return (
    <div
      className={clsx("glass", pad && "p-4", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
