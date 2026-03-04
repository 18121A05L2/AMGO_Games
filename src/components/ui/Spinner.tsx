import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className, size = 24, ...props }) => {
  return (
    <Loader2 
      size={size} 
      className={cn("animate-spin text-muted-foreground", className)} 
      {...props} 
    />
  )
}
