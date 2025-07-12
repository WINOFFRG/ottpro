import { landingConfig } from "@/lib/config";
import { DownloadButton } from "./ui/download-button";

export function DownloadSection() {
	const { downloads } = landingConfig;

	return (
		<div className="flex flex-wrap items-center justify-center gap-2">
			{downloads.map((download) => (
				<DownloadButton download={download} key={download.id} />
			))}
		</div>
	);
}
