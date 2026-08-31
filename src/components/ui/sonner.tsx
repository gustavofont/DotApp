import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

// DotCard is dark-only (DESIGN.md — no light mode), so theme is hardcoded
// rather than read from a theme provider the app doesn't have.
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--error-bg": "var(--popover)",
          "--error-text": "var(--destructive)",
          "--error-border": "color-mix(in srgb, var(--destructive) 40%, var(--border))",
          "--success-bg": "var(--popover)",
          "--success-text": "var(--foreground)",
          "--success-border": "var(--border)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "rounded-lg font-sans",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
