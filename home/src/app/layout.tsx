import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "OTTPRO — Your force field against OTT restrictions",
	description:
		"Patches for OTT platforms to binge with freedom! Bypass account sharing restrictions, block ads, and enhance your streaming experience.",
	keywords: [
		"OTT",
		"streaming",
		"Netflix",
		"browser extension",
		"ad blocker",
		"account sharing",
	],
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html className="dark" lang="en">
			<body className={`${geistSans.variable} font-sans antialiased`}>
				{children}
			</body>
		</html>
	);
}
