"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentProps<"a"> & {
  href: string;
  onAction?: () => void;
  className?: string;
  children: React.ReactNode;
};

/** Renders a button when `onAction` is set, otherwise a Next.js Link. */
export function ActionLink({ href, onAction, className, children, ...rest }: Props) {
  if (onAction) {
    return (
      <button type="button" onClick={onAction} className={cn(className, "text-left")}>
        {children}
      </button>
    );
  }
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}
