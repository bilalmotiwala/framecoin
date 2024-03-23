import "@/styles/globals.css";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import { Link } from "@nextui-org/link";
import clsx from "clsx";

import { getFrameMetadata } from "@coinbase/onchainkit";

const frameMetadata = getFrameMetadata({
	buttons: [
		{
			label: "Launch A Token",
			action: "post",
			target: "https://framecoin.lol",
		},
	],
	image: "https://google.com"
});

export const metadata: Metadata = {
	title: {
		default: siteConfig.name,
		template: `%s - ${siteConfig.name}`,
	},
	description: siteConfig.description,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon-16x16.png",
		apple: "/apple-touch-icon.png",
	},
	other: {
		...frameMetadata,
	}
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body
				className={clsx(
					"min-h-screen bg-background font-sans antialiased",
					fontSans.variable
				)}
			>
				<Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
					<div className="relative flex flex-col h-screen">
						<Navbar />
						<main className="flex mx-auto max-w-7xl px-6 flex-grow items-center justify-center" style={{
							minHeight: "calc(100vh - 112px)",
						}}>
							{children}
						</main>
						<footer className="w-full flex items-center justify-center py-3">
							<Link
								isExternal
								className="flex items-center gap-1 text-current"
								href="https://warpcast.com/bilalmotiwala"
								title="nextui.org homepage"
							>
								<span className="text-default-600">Built with ❤️ for the Frameworks Hackathon by</span>
								<p className="text-primary">Bilal Motiwala</p>
							</Link>
						</footer>
					</div>
				</Providers>
			</body>
		</html>
	);
}
