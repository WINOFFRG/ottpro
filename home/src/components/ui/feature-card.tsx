import type { Feature } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
	feature: Feature;
	className?: string;
}

export function FeatureCard({ feature, className }: FeatureCardProps) {
	const { title, description, icon } = feature;
	const { color, bgColor } = icon;

	return (
		<div className={cn("space-y-2 text-center", className)}>
			<div
				className={cn(
					"mx-auto flex h-8 w-8 items-center justify-center rounded-lg",
					bgColor
				)}
			>
				<div className={cn("h-4 w-4 rounded-sm", color)} />
			</div>
			<div>
				<h4 className="font-medium text-sm">{title}</h4>
				<p className="text-muted-foreground text-xs">{description}</p>
			</div>
		</div>
	);
}
