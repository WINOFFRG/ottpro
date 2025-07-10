import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { useRootStore, useRuleEnabled, useToggleRule } from "../hooks/useStore";

interface RuleItemProps {
	ruleId: string;
	title: string;
	description?: string;
}

export function RuleItem({ ruleId, title, description }: RuleItemProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const currentApp = useRootStore((state) => state.currentApp);
	const toggleRule = useToggleRule();
	const isEnabled = useRuleEnabled(currentApp?.id || "", ruleId);

	const handleToggle = async () => {
		if (currentApp) {
			await toggleRule(currentApp.id, ruleId);
		}
	};

	return (
		<Collapsible onOpenChange={setIsExpanded} open={isExpanded}>
			<div className="flex flex-col gap-1">
				<div className="flex items-center justify-between rounded-full py-1">
					<div className="flex flex-1 items-center gap-1">
						<CollapsibleTrigger asChild>
							<Button
								className="size-6 justify-start text-white/40 transition-colors hover:bg-transparent hover:text-white/60"
								size="icon"
								variant="ghost"
							>
								<ChevronRight
									className={`size-4 transition-transform duration-200 ${
										isExpanded ? "rotate-90" : ""
									}`}
								/>
							</Button>
						</CollapsibleTrigger>
						<p className="m-0 font-normal text-sm text-white">{title}</p>
					</div>
					<Switch
						checked={isEnabled}
						className="relative h-6 w-10 cursor-pointer rounded-full border-2 border-white/10 p-1 shadow-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=checked]:border-transparent data-[state=checked]:bg-white/30 data-[state=unchecked]:bg-transparent"
						onCheckedChange={handleToggle}
					/>
				</div>
				{description && (
					<CollapsibleContent className="slide-in-from-top-2 fade-in animate-in duration-200">
						<p className="m-0 pl-1 text-white/60 text-xs leading-tight">
							{description}
						</p>
					</CollapsibleContent>
				)}
			</div>
		</Collapsible>
	);
}
