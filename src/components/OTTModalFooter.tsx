import { Suspense } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "./ui/drawer";

export function OTTModalFooter() {
	const sampleLogs = [
		{
			timestamp: "14:30:22",
			level: "INFO",
			message: "Extension initialized successfully",
		},
		{
			timestamp: "14:30:25",
			level: "DEBUG",
			message: "Detected Netflix player",
		},
		{
			timestamp: "14:30:28",
			level: "INFO",
			message: "Applied playback speed: 1.25x",
		},
		{
			timestamp: "14:30:31",
			level: "DEBUG",
			message: "Skipped intro: 15 seconds",
		},
		{
			timestamp: "14:30:35",
			level: "INFO",
			message: "Auto-next episode enabled",
		},
		{
			timestamp: "14:30:38",
			level: "DEBUG",
			message: "Volume normalized to 80%",
		},
		{
			timestamp: "14:30:42",
			level: "INFO",
			message: "Quality changed to 1080p",
		},
		{
			timestamp: "14:30:45",
			level: "DEBUG",
			message: "Subtitle track changed: English",
		},
		{
			timestamp: "14:30:48",
			level: "INFO",
			message: "Blocked advertisements: 3",
		},
		{
			timestamp: "14:30:51",
			level: "DEBUG",
			message: "Enhanced audio quality applied",
		},
		{
			timestamp: "14:30:54",
			level: "INFO",
			message: "Custom UI themes loaded",
		},
		{
			timestamp: "14:30:57",
			level: "DEBUG",
			message: "Performance optimizations active",
		},
	];

	const getLogLevelStyles = (level: string) => {
		if (level === "INFO") {
			return "bg-blue-500/20 text-blue-300";
		}
		if (level === "DEBUG") {
			return "bg-gray-500/20 text-gray-300";
		}
		return "bg-red-500/20 text-red-300";
	};

	return (
		<div className="w-full flex-shrink-0 bg-[rgba(28,28,28,0.95)] backdrop-blur-[20px]">
			<div className="flex gap-1 border-white/15 border-t px-4 py-3">
				<Button
					className="min-h-9 flex-1 rounded-3xl border-0 bg-white/10 px-3 py-2 font-medium text-sm text-white transition-all duration-200 hover:bg-white/20 hover:text-white"
					// onClick={onTurnOff}
					size="default"
					variant="ghost"
				>
					Turn Off
				</Button>
				<Suspense fallback={<div>Loading...</div>}>
					<Drawer>
						<DrawerTrigger>
							<Button
								asChild
								className="min-h-9 flex-1 rounded-3xl border-0 bg-white/10 px-3 py-2 font-medium text-sm text-white transition-all duration-200 hover:bg-white/20 hover:text-white"
								size="default"
								variant="ghost"
							>
								Logs
							</Button>
						</DrawerTrigger>
						<DrawerContent
							className={cn(
								"rounded-3xl border-white/15 border-t bg-[rgba(28,28,28,0.99)] text-white backdrop-blur-lg"
							)}
						>
							<div className="mx-auto mt-2 h-1.5 w-[60px] shrink-0 rounded-full bg-white/20" />
							<DrawerHeader className="flex-shrink-0 px-4 py-2">
								<DrawerTitle className="font-medium text-sm text-white">
									Extension Logs
								</DrawerTitle>
							</DrawerHeader>

							<div className="flex flex-1 flex-col overflow-hidden px-4 pb-4">
								<div className="flex h-full max-h-[42vh] flex-col gap-1 overflow-y-auto overscroll-contain">
									{sampleLogs.map((log) => (
										<div
											className="@container flex flex-col gap-2 rounded-md border border-white/10 bg-white/5 p-2"
											key={`${log.timestamp}-${log.message}`}
										>
											<div className="flex flex-row items-center gap-2">
												<span className="w-12 flex-shrink-0 font-mono text-[10px] text-white/50">
													{log.timestamp}
												</span>
												<span
													className={`flex-shrink-0 rounded-full px-1.5 py-0.5 font-medium text-[9px] ${getLogLevelStyles(log.level)}`}
												>
													{log.level}
												</span>
											</div>
											<span className="min-w-0 flex-1 @[300px]:break-words text-[11px] text-white/80">
												{log.message}
											</span>
										</div>
									))}
								</div>
							</div>
						</DrawerContent>
					</Drawer>
				</Suspense>
			</div>
		</div>
	);
}
