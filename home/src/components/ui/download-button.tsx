import Image from "next/image";
import Link from "next/link";
import type { DownloadButton as DownloadButtonType } from "@/lib/types";
import { Button } from "./button";

interface DownloadButtonProps {
	download: DownloadButtonType;
}

export function DownloadButton({ download }: DownloadButtonProps) {
	const { platform, icon, url, label } = download;

	return (
		<Button
			asChild
			className={
				"hover:-outline-offset-2 flex h-12 w-32 cursor-pointer items-center justify-start gap-2 rounded-full border border-white/10 bg-transparent px-3 py-2 text-left transition-all duration-200 hover:border-white/30 hover:outline-3 hover:outline-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 active:border-white/50"
			}
			variant="ghost"
		>
			<Link href={url} target="_blank">
				<div className="flex h-8 w-8 items-center justify-center">
					<Image
						alt={platform}
						className="size-8"
						height={24}
						src={icon}
						width={24}
					/>
				</div>
				<div className="mt-0.5 flex flex-col">
					<span className="font-semibold text-white/60 text-xs leading-3">
						{label}
					</span>
					<span className="font-medium text-base text-white">{platform}</span>
				</div>
			</Link>
		</Button>
	);
}
