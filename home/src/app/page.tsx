import { DownloadButton } from "@/components/download-button";
import { PreviewSection } from "@/components/preview-section";
import { landingConfig } from "@/lib/config";

export default function Home() {
	const { hero, downloads } = landingConfig;

	return (
		<section className="mt-20 flex flex-1 flex-col items-center">
			<div className="mx-auto w-full max-w-2xl space-y-8 text-center">
				<div className="flex flex-col items-center justify-center gap-3 text-center">
					<h1 className="text-balance font-medium text-4xl leading-tight md:text-5xl">
						{hero.title}
					</h1>
					<p className="font-medium text-white/80 text-xl">{hero.subtitle}</p>
				</div>
				<div className="flex flex-wrap items-center justify-center gap-2">
					{downloads.map((download) => (
						<DownloadButton download={download} key={download.id} />
					))}
				</div>
			</div>
			<PreviewSection />
		</section>
	);
}
