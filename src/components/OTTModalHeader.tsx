import { X } from "lucide-react";
import packageJson from "../../package.json" with { type: "json" };
import { Button } from "./ui/button";

export function OTTModalHeader() {
	const root = useRootStore((state) => state.root);

	const handleClose = () => {
		root?.remove();
	};

	return (
		<div className="group fade-in relative h-16 w-full flex-shrink-0 animate-in overflow-hidden bg-gradient-to-r from-red-600/90 via-foreground/80 to-transparent backdrop-blur-md duration-700 before:absolute before:inset-0 before:bg-gradient-to-br before:from-red-500/60 before:via-transparent before:to-foreground/40 after:absolute after:inset-0 after:bg-gradient-to-tr after:from-foreground/70 after:via-transparent after:to-red-400/30">
			<div className="fade-in slide-in-from-right-3 relative flex h-full animate-in items-center justify-between px-4 duration-600 ">
				<div className="flex flex-col space-y-0.5">
					<p className="transparent fade-in slide-in-from-left-2 m-0 animate-in bg-gradient-to-r from-white via-white/95 to-white/80 bg-clip-text font-medium font-mono text-base text-white duration-500 ">
						{packageJson.name}
					</p>
					<span className="fade-in slide-in-from-left-1 animate-in font-normal text-sm text-white/50 duration-500 ">
						v{packageJson.version}
					</span>
				</div>
				<Button
					className="fade-in zoom-in-50 z-1 flex h-8 w-8 transition-allhover:scale-105 animate-in cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 duration-400 hover:rotate-90 hover:border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-red-500/20"
					onClick={handleClose}
					size="icon"
				>
					<X className="h-4 w-4 text-white/60 transition-colors duration-200 hover:text-white/80" />
				</Button>
			</div>
		</div>
	);
}
