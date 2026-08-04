import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "font-jakarta flex items-center gap-3 rounded-full px-6 py-3 shadow-float text-sm w-fit whitespace-nowrap",
          default: "bg-brand text-white",
          success: "bg-brand text-white",
          error: "bg-destructive text-white",
          description: "text-white/70 text-xs",
          icon: "shrink-0",
        },
      }}
    />
  )
}
