import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("bg-brand/6 animate-pulse rounded-md", className)} {...props} />
}
