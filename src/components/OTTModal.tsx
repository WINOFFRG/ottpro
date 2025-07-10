import { useAppEnabled, useRootStore, useToggleApp } from "../hooks/useStore";
// import { OTTModalFooter } from "./OTTModalFooter";
import { OTTModalHeader } from "./OTTModalHeader";
import { RuleItem } from "./RuleItem";
import { RuleSection } from "./RuleSection";
import { SocialSection } from "./SocialSection";
import { Switch } from "./ui/switch";

export function OTTModal() {
	const currentApp = useRootStore((state) => state.currentApp);
	const toggleApp = useToggleApp();
	const isAppEnabled = useAppEnabled(currentApp?.id || "");

	const handleAppToggle = async () => {
		if (currentApp) {
			await toggleApp(currentApp.id);
		}
	};

	return (
		<div
			className={
				"slide-in-from-right-2 fade-in no-scrollbar pointer-events-auto fixed top-3 right-3 isolate z-[9999999] flex max-h-[90vh] w-72 transform-gpu animate-in flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-800 shadow-[0px_0px_28px_0px_rgba(0,0,0,0.5)] backdrop-blur-[40px] transition-all duration-300"
			}
			style={{
				transition:
					"box-shadow 0.2s, opacity 0.2s, transform 0.2s, max-height 0.3s",
			}}
		>
			<OTTModalHeader />
			<div
				className="min-h-0 flex-1 overflow-y-auto px-0"
				style={{
					msScrollChaining: "none",
					overscrollBehavior: "contain",
					scrollbarWidth: "none",
					msOverflowStyle: "none",
				}}
			>
				{currentApp && (
					<>
						<div className="border-white/10 border-b px-4 py-3">
							<div className="flex items-center justify-between">
								<div className="min-w-0 flex-1">
									<h3 className="truncate font-medium text-sm text-white">
										Enable {currentApp.name}
									</h3>
									<p className="mt-1 text-white/60 text-xs">
										Master switch for all features
									</p>
								</div>
								<div className="">
									<Switch
										aria-label={`Toggle ${currentApp.name}`}
										checked={isAppEnabled}
										className="relative h-6 w-10 cursor-pointer rounded-full border-2 border-white/10 p-1 shadow-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=checked]:border-transparent data-[state=checked]:bg-white/30 data-[state=unchecked]:bg-transparent"
										onCheckedChange={handleAppToggle}
									/>
								</div>
							</div>
						</div>
						{isAppEnabled && currentApp.rules?.length > 0 && (
							<RuleSection title="Rules">
								{currentApp.rules.map((rule) => (
									<RuleItem
										description={rule.description}
										key={rule.id}
										ruleId={rule.id}
										title={rule.name}
									/>
								))}
							</RuleSection>
						)}
					</>
				)}

				<SocialSection />
			</div>
			{/* <OTTModalFooter /> */}
		</div>
	);
}
