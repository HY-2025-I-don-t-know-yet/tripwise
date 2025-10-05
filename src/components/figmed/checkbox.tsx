import { Checkbox } from "@/components/ui/checkbox"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function FigmaCheckbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
        "relative border-white/40 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 shadow-[0_6px_12px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.3),0_1px_2px_rgba(255,255,255,0.1)_inset] data-[state=checked]:shadow-[0_8px_16px_rgba(168,85,247,0.5),0_4px_8px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-3px_6px_rgba(0,0,0,0.3)] transform data-[state=checked]:translate-y-[-2px] transition-all"
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
export {FigmaCheckbox}