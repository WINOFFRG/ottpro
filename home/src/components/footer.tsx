import { landingConfig } from "@/lib/config";

export function Footer() {
	const { footer } = landingConfig;

	return (
		<footer className="flex flex-col items-center justify-center pb-8 text-center text-white/40">
			<div className="max-w-md px-5">
				<span className="text-sm">
					{footer.text}{" "}
					<a
						className="underline transition-colors hover:text-white"
						href={footer.link.url}
						rel="noopener noreferrer"
						target="_blank"
					>
						{footer.link.text}
					</a>
				</span>
			</div>
		</footer>
	);
}
