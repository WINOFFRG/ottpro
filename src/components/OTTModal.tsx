import { useEffect, useState } from "react";
import { OTTModalFooter } from "./OTTModalFooter";
import { OTTModalHeader } from "./OTTModalHeader";
import { RuleItem } from "./RuleItem";
import { RuleSection } from "./RuleSection";
import { SocialSection } from "./SocialSection";

interface OTTModalProps {
	root: HTMLElement;
}

export function OTTModal({ root }: OTTModalProps) {
	const [provider, setProvider] = useState<"netflix" | "hotstar" | "unknown">(
		"unknown"
	);
	const [isLogsDrawerOpen, setIsLogsDrawerOpen] = useState(false);

	// Detect current provider
	useEffect(() => {
		const hostname = window.location.hostname;
		if (hostname.includes("netflix")) {
			setProvider("netflix");
		} else if (hostname.includes("hotstar")) {
			setProvider("hotstar");
		} else {
			setProvider("netflix");
		}
	}, []);

	const getProviderInfo = () => {
		switch (provider) {
			case "netflix":
				return {
					name: "Netflix",
					version: "v1.0.0",
				};
			case "hotstar":
				return {
					name: "Hotstar",
					version: "v1.0.0",
				};
			default:
				return {
					name: "OTT Enhancer",
					version: "v1.0.0",
				};
		}
	};

	const providerInfo = getProviderInfo();

	// Proper close handler that unmounts the UI
	const handleClose = () => {
		console.log("handleClose", root);
		root.remove();
	};

	const handleTurnOff = () => {
		// Logic to turn off the extension
		console.log("Turning off extension...");
		handleClose();
	};

	return (
		<div
			className={`fixed top-3 right-3 w-[278px] ${
				isLogsDrawerOpen ? "max-h-[90vh]" : "max-h-[calc(100vh-300px)]"
			} slide-in-from-right-2 fade-in pointer-events-auto isolate z-[9999999] flex transform-gpu animate-in flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-800 shadow-[0px_0px_28px_0px_rgba(0,0,0,0.5)] backdrop-blur-[40px] transition-all duration-300`}
			style={{
				transition:
					"box-shadow 0.2s, opacity 0.2s, transform 0.2s, max-height 0.3s",
				msScrollChaining: "none",
				overscrollBehavior: "contain",
			}}
		>
			<OTTModalHeader
				onClose={handleClose}
				providerName={providerInfo.name}
				version={providerInfo.version}
			/>

			<div
				className="min-h-0 flex-1 overflow-y-auto px-0"
				style={{
					msScrollChaining: "none",
					overscrollBehavior: "contain",
					scrollbarWidth: "none",
					msOverflowStyle: "none",
				}}
			>
				{provider !== "unknown" && (
					<RuleSection title="Rules">
						<RuleItem
							description="Force maximum quality streaming up to 4K resolution"
							title="Enable 4K"
						/>
						<RuleItem
							description="Automatically skip intro sequences"
							title="Skip Intro"
						/>
						<RuleItem
							description="Automatically play next episode without countdown"
							title="Auto Next Episode"
						/>
					</RuleSection>
				)}

				<SocialSection />
			</div>

			<OTTModalFooter onTurnOff={handleTurnOff} />
		</div>
	);
}
