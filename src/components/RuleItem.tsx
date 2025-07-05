import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface RuleItemProps {
  title: string;
  description?: string;
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
}

export function RuleItem({
  title,
  description,
  enabled = false,
  onChange,
}: RuleItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="flex flex-col gap-1">
        <div className="py-1 flex items-center justify-between rounded-full">
          <div className="flex items-center gap-1 flex-1">
            <CollapsibleTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-6 text-white/40 hover:text-white/60 transition-colors hover:bg-transparent justify-start"
              >
                <ChevronRight
                  className={`size-4 transition-transform duration-200 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
            <p className="text-white text-base font-normal m-0">{title}</p>
          </div>

          <Switch
            className="relative w-10 h-6 p-1 
                       data-[state=unchecked]:bg-transparent data-[state=checked]:bg-white/30
                       border-2 border-white/10 data-[state=checked]:border-transparent
                       rounded-full shadow-none cursor-pointer 
                       focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none
                       transition-all duration-200"
          />
        </div>

        {description && (
          <CollapsibleContent className="ml-4 animate-in slide-in-from-top-2 fade-in duration-200">
            <p className="text-white/60 text-xs leading-relaxed m-0 pl-1">
              {description}
            </p>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}
