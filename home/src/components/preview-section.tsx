"use client";

import type { StaticImport } from "next/dist/shared/lib/get-img-props";
import { useState } from "react";
import ProductImage1 from "@/assets/product_1.png";
import ZoomableImage from "@/components/ui/zoomable-image";

interface FeatureItem {
	title: string;
	isNew?: boolean;
	image: string | StaticImport;
	disabled?: boolean;
}

const features: FeatureItem[] = [
	{
		title: "Bypass Netflix household device blocking",
		image: ProductImage1,
	},
	{
		title: "Coming Soon",
		isNew: false,
		image: ProductImage1,
		disabled: true,
	},
];

export function PreviewSection() {
	const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
	const [currentImage, setCurrentImage] = useState<string | StaticImport>(
		features[0].image
	);

	const handleMouseEnter = (feature: FeatureItem, index: number) => {
		if (feature.disabled) {
			return;
		}
		setHoveredFeature(index);
		setCurrentImage(feature.image);
	};

	const handleMouseLeave = () => {
		setHoveredFeature(null);
		setCurrentImage(features[0].image);
	};

	return (
		<div className="mt-14 flex w-full max-w-5xl flex-col overflow-hidden border bg-background md:flex-row">
			<div className="order-2 size-full overflow-y-auto md:order-1 md:px-0">
				<ul className="will-change-transform">
					{features.map((feature, index) => (
						<li className="group border-white/10 border-b" key={feature.title}>
							<button
								className={`flex w-full items-center px-6 py-4 text-left ${
									feature.disabled ? "cursor-help" : "cursor-pointer"
								}`}
								onMouseEnter={() => handleMouseEnter(feature, index)}
								onMouseLeave={handleMouseLeave}
								type="button"
							>
								<h3
									className={`flex items-center font-medium text-base transition-colors ${
										hoveredFeature === index
											? "text-foreground"
											: "text-zinc-500 dark:text-zinc-400"
									}`}
								>
									<span className="transition-colors hover:text-white">
										{feature.title}
									</span>
									{feature.isNew && (
										<div className="mx-2 rounded-sm border border-blue-600 bg-background px-2.5 py-0.5 text-blue-600 text-xs dark:border-blue-400 dark:text-blue-400">
											NEW
										</div>
									)}
								</h3>
							</button>
						</li>
					))}
				</ul>
			</div>
			<div className="order-1 flex size-full justify-center overflow-y-auto md:order-2">
				<ZoomableImage
					alt="feature-preview"
					className="size-full rounded-md md:rounded-none"
					src={currentImage as string}
				/>
			</div>
		</div>
	);
}
