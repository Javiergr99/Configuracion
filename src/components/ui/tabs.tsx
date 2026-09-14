import type { ReactNode } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/shared/lib/cn";

type TabDefinition = { value: string; label: string; content: ReactNode };

type TabsProps = {
  defaultValue: string;
  tabs: TabDefinition[];
  className?: string;
};

export function Tabs({ defaultValue, tabs, className }: TabsProps) {
  return (
    <TabsPrimitive.Root defaultValue={defaultValue} className={className}>
      <TabsPrimitive.List className="flex border-b border-slate-200 bg-white px-6">
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className="focus-ring relative min-h-12 px-4 text-sm font-semibold text-slate-500 transition hover:text-slate-800 data-[state=active]:text-brand-600 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-brand-600 after:opacity-0 data-[state=active]:after:opacity-100"
          >
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.value}
          value={tab.value}
          className={cn("outline-none", className)}
        >
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
