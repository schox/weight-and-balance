import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva(
  "inline-flex items-center justify-center w-full",
  {
    variants: {
      variant: {
        default: "gap-0",
        pills: "gap-1 p-1 bg-muted rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1",
  {
    variants: {
      variant: {
        default: [
          "relative",
          "border-2 border-black",
          "rounded-t-lg",
          "bg-gray-100 text-black",
          // Active state - key changes for gap fix
          "data-[state=active]:bg-white",
          "data-[state=active]:z-10",
          // Fix gap by extending active tab downward
          "data-[state=active]:pb-[calc(0.5rem+2px)]",
          "data-[state=active]:mb-[-2px]",
          "data-[state=active]:border-b-white",
          // Inactive tabs
          "data-[state=inactive]:border-r-0",
          "last:data-[state=inactive]:border-r-2",
        ],
        pills: [
          "rounded-md",
          "data-[state=active]:bg-background",
          "data-[state=active]:shadow-sm",
          "data-[state=inactive]:hover:bg-muted/50",
        ],
        colored: [
          "relative",
          "border-2 border-black",
          "rounded-t-lg",
          "bg-gray-100 text-black",
          // Same gap fix for colored variant
          "data-[state=active]:text-white",
          "data-[state=active]:z-10",
          "data-[state=active]:pb-[calc(0.5rem+2px)]",
          "data-[state=active]:mb-[-2px]",
          "data-[state=active]:border-b-transparent",
          // Inactive tabs
          "data-[state=inactive]:border-r-0",
          "last:data-[state=inactive]:border-r-2",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {
  activeColor?: string;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, activeColor, style, ...props }, ref) => {
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Merge refs
  React.useImperativeHandle(ref, () => triggerRef.current!);

  // Apply active color dynamically if provided
  const dynamicStyle = React.useMemo(() => {
    if (!activeColor || variant !== 'colored') return style;

    return {
      ...style,
      '--active-bg': activeColor,
    };
  }, [activeColor, variant, style]);

  return (
    <TabsPrimitive.Trigger
      ref={triggerRef}
      className={cn(
        tabsTriggerVariants({ variant }),
        variant === 'colored' && activeColor && `data-[state=active]:bg-[var(--active-bg)]`,
        className
      )}
      style={dynamicStyle}
      {...props}
    />
  );
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const tabsContentVariants = cva(
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-2 border-black border-t-2 rounded-b-lg bg-white pt-0",
        pills: "mt-2",
        colored: "border-2 border-black border-t-2 rounded-b-lg bg-white pt-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>,
    VariantProps<typeof tabsContentVariants> {}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(tabsContentVariants({ variant }), className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
export type { TabsListProps, TabsTriggerProps, TabsContentProps }