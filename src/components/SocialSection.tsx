import { ChevronRight } from "lucide-react";

export function SocialSection() {
	return (
		<div className="flex flex-col gap-2 border-white/10 border-t px-4 py-4">
			<p className="m-0 font-medium text-white/60 text-xs">Support</p>
			<div className="flex flex-col gap-1">
				<a
					className="group flex items-center justify-between rounded px-2 py-1 transition-colors hover:bg-white/5"
					href="#"
				>
					<p className="m-0 font-medium text-base text-white transition-colors group-hover:text-white/80">
						Join Discord
					</p>
					<ChevronRight className="h-[18px] w-[18px] text-white/60 transition-colors group-hover:text-white/80" />
				</a>
				<a
					className="group flex items-center justify-between rounded px-2 py-1 transition-colors hover:bg-white/5"
					href="#"
				>
					<p className="m-0 font-medium text-base text-white transition-colors group-hover:text-white/80">
						Donate
					</p>
					<ChevronRight className="h-[18px] w-[18px] text-white/60 transition-colors group-hover:text-white/80" />
				</a>
				<a
					className="group flex items-center justify-between rounded px-2 py-1 transition-colors hover:bg-white/5"
					href="#"
				>
					<p className="m-0 font-medium text-base text-white transition-colors group-hover:text-white/80">
						Rate Us
					</p>
					<ChevronRight className="h-[18px] w-[18px] text-white/60 transition-colors group-hover:text-white/80" />
				</a>
			</div>
		</div>
	);
}
