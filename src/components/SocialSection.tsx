import { ChevronRight } from "lucide-react";

export function SocialSection() {
	return (
		<div className="border-t border-white/10 px-4 py-4 flex flex-col gap-2">
			<p className="text-white/60 text-xs font-medium m-0">Support</p>
			<div className="flex flex-col gap-1">
				<a
					href="#"
					className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded transition-colors group"
				>
					<p className="text-white text-base font-medium m-0 group-hover:text-white/80 transition-colors">
						Join Discord
					</p>
					<ChevronRight className="w-[18px] h-[18px] text-white/60 group-hover:text-white/80 transition-colors" />
				</a>
				<a
					href="#"
					className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded transition-colors group"
				>
					<p className="text-white text-base font-medium m-0 group-hover:text-white/80 transition-colors">
						Donate
					</p>
					<ChevronRight className="w-[18px] h-[18px] text-white/60 group-hover:text-white/80 transition-colors" />
				</a>
				<a
					href="#"
					className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded transition-colors group"
				>
					<p className="text-white text-base font-medium m-0 group-hover:text-white/80 transition-colors">
						Rate Us
					</p>
					<ChevronRight className="w-[18px] h-[18px] text-white/60 group-hover:text-white/80 transition-colors" />
				</a>
			</div>
		</div>
	);
}
