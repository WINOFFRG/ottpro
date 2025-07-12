import type { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ZoomableImageProps {
	src: string | StaticImport;
	alt?: string;
	className?: string;
}

export default function ZoomableImage({
	src,
	alt,
	className,
}: ZoomableImageProps) {
	if (!src) {
		return null;
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Image
					alt={alt || ""}
					className={className}
					height={100}
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					src={src}
					style={{
						width: "100%",
						height: "auto",
					}}
					width={500}
				/>
			</DialogTrigger>
			<DialogContent
				className="flex min-h-screen min-w-screen items-center justify-center bg-black/10 p-8 backdrop-blur-md"
				title="Zoomable Image"
			>
				<div className="relative h-[60vh] w-full overflow-hidden rounded-lg sm:h-[70vh] md:h-[80vh] lg:h-[85vh]">
					<Image
						alt={alt || ""}
						className="h-full w-full object-contain"
						fill
						src={src}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
