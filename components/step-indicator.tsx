import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
}

const steps = [
  { number: 1, title: "Choose Niche", description: "Pick your market" },
  { number: 2, title: "Generate Page", description: "Create content" },
]

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isComplete = currentStep > step.number
          const isActive = currentStep === step.number

          return (
            <div key={step.number} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold transition-all duration-300 sm:h-12 sm:w-12 sm:text-lg",
                    isComplete && "bg-primary text-primary-foreground",
                    isActive && "bg-primary text-primary-foreground ring-2 ring-primary/35",
                    !isComplete && !isActive && "bg-muted text-muted-foreground",
                  )}
                >
                  {isComplete ? <Check className="h-5 w-5" /> : step.number}
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-sm font-bold sm:text-base",
                      currentStep >= step.number ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="hidden text-xs text-muted-foreground sm:block">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="mx-3 h-0.5 min-w-[2rem] flex-1 overflow-hidden rounded-full bg-muted sm:mx-4">
                  <div
                    className={cn(
                      "h-full bg-primary transition-all duration-500",
                      isComplete ? "w-full" : "w-0",
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
