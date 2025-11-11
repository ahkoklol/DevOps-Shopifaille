import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../components/ui/utils";

/**
 * Shadcn-like Switch adapted to your repo structure.
 * - No "use client" (Vite/CRA friendly)
 * - Uses cn from shared/lib/utils
 * - Radix import without version suffix
 */
export type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root>;

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(function Switch({ className, ...props }, ref) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-background",
        "dark:data-[state=unchecked]:bg-input/80",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full ring-0 transition-transform",
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
          "bg-card",
          "dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground"
        )}
      />
    </SwitchPrimitive.Root>
  );
});
