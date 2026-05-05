import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: "default" | "yellow" | "blue" | "green" | "red";
}

const colorMap = {
  default: { icon: "bg-muted text-muted-foreground",                                              border: "border-l-zinc-400 dark:border-l-zinc-500" },
  yellow:  { icon: "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",        border: "border-l-amber-500" },
  blue:    { icon: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",            border: "border-l-blue-500" },
  green:   { icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400", border: "border-l-emerald-500" },
  red:     { icon: "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400",                border: "border-l-red-500" },
};

export function KpiCard({ title, value, icon: Icon, color = "default" }: KpiCardProps) {
  const { icon: iconClass, border } = colorMap[color];
  return (
    <Card className={cn("shadow-sm border-l-4", border)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium leading-tight truncate">{title}</p>
            <p className="text-3xl sm:text-4xl font-bold text-foreground mt-1 leading-none">{value}</p>
          </div>
          <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0", iconClass)}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
