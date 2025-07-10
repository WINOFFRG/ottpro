import { ChevronRight } from "lucide-react";

export function SocialSection() {
	const { socialLinks } = useAppConfig();

	return (
		<div className="flex flex-col gap-2 border-white/10 border-t px-4 py-4">
			<p className="m-0 font-medium text-sm text-white/60">Support</p>
			<div className="flex flex-col gap-1">
				{socialLinks?.map((link) => (
					<a
						className="group flex items-center justify-between rounded px-2 py-1 transition-colors hover:bg-white/5"
						href={link.url}
						key={link.url}
						rel="noopener noreferrer"
						target="_blank"
					>
						<p className="m-0 font-medium text-sm text-white transition-colors group-hover:text-white/80">
							{link.name}
						</p>
						<ChevronRight className="size-[18px] text-white/60 transition-colors group-hover:text-white/80" />
					</a>
				))}
			</div>
		</div>
	);
}
