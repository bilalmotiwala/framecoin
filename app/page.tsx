import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code"
import { button as buttonStyles } from "@nextui-org/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";

export default function Home() {
	return (
		<section className="flex flex-col items-center justify-center gap-4">
			<div className="inline-block max-w-xl text-center justify-center">
				<h1 className={title()}>Create and launch tokens within&nbsp;</h1>
				<h1 className={title({ color: "violet" })}>Farcaster Frames&nbsp;</h1>
				<h2 className={subtitle({ class: "mt-4" })}>
					in less than a minute. No code required.
				</h2>
			</div>

			<div className="flex gap-3">
				<Link
					href="/create"
					className={buttonStyles({ color: "secondary", radius: "full", variant: "shadow" })}
				>
					Start
				</Link>
				<Link
					isExternal
					className={buttonStyles({ variant: "bordered", radius: "full" })}
					href={siteConfig.links.github}
				>
					<GithubIcon size={20} />
					GitHub
				</Link>
			</div>
		</section>
	);
}
