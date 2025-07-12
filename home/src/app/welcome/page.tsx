import Image from "next/image";
import WelcomeImage from "@/assets/ottpro_welcome.gif";

export default function WelcomePage() {
	return (
		<section className="mt-20 flex h-dvh flex-1 flex-col">
			<div className="mt-12 flex flex-col items-center justify-center gap-12 text-center">
				<h1 className="text-balance font-medium text-2xl leading-tight md:text-3xl">
					Welcome Aboard 👋
				</h1>
				<Image
					alt="Welcome"
					className="rounded-xl border"
					height={400}
					src={WelcomeImage}
					width={400}
				/>
			</div>
		</section>
	);
}
