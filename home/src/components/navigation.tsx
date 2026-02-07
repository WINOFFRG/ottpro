import Image from "next/image";
import Link from "next/link";
import GithubIconLight from "@/assets/github-mark-white.svg";
import Logo from "@/assets/proudct_icon.png";
import { cn } from "@/lib/utils";
import { AnimatedShinyText } from "./ui/shiny-text";

export function Navigation() {
  return (
    <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 pt-4 sm:px-6 lg:px-8">
      <Link className="flex items-center gap-3" href="/">
        <h1 className="font-medium text-foreground text-xl">OTTPRO</h1>
        <Image alt="Logo" height={64} src={Logo} width={64} />
      </Link>
      <div className="z-10 flex items-center justify-center">
        <div
          className={cn(
            "group flex flex-row items-center justify-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800",
          )}
        >
          <Image
            alt="Github"
            className="bg-accent"
            height={18}
            src={GithubIconLight}
            width={18}
          />
          <AnimatedShinyText>
            <Link href={"https://github.com/winoffrg/ottpro"} target="_blank">
              Star on Github
            </Link>
          </AnimatedShinyText>
        </div>
      </div>
    </nav>
  );
}
