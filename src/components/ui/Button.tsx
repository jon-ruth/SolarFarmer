"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-400",
          "disabled:pointer-events-none disabled:opacity-50",
          // Variants
          {
            "bg-solar-500 text-white hover:bg-solar-600 active:bg-solar-700":
              variant === "primary",
            "bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400":
              variant === "secondary",
            "border-2 border-solar-500 text-solar-500 hover:bg-solar-50 active:bg-solar-100":
              variant === "outline",
            "text-gray-600 hover:bg-gray-100 active:bg-gray-200":
              variant === "ghost",
          },
          // Sizes
          {
            "h-8 px-3 text-sm rounded-md": size === "sm",
            "h-10 px-4 text-base rounded-lg": size === "md",
            "h-12 px-6 text-lg rounded-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
