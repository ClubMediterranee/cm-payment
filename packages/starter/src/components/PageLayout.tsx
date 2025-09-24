import type {PropsWithChildren} from "react";
import {Icon} from "@clubmed/trident-icons";
import cx from "classnames";

type PageLayoutProps = PropsWithChildren<{
  title: string;
  mediaType?: "image" | "logo";
  withoutArrowButton?: boolean;
  interactionId?: string;
  backInteraction?: string;
  withoutHeader?: boolean;
  className?: string;
}>;

export function PageLayout(props: PageLayoutProps) {
  const {className, children} = props;

  return (
    <div className="mx-auto my-20 flex flex-col items-center md:px-16 sm:my-40">
      <main className="w-full max-w-[56rem]">
        <div className="flex flex-col items-center space-y-12">
          <Icon name="ClubMed" width="179px" className={"text-white"}/>
          <h1 className="grow px-4 text-center text-b2 text-white font-semibold">{props.title}</h1>

          <div className={cx("w-full bg-white rounded-16 py-16", className)}>{children}</div>
        </div>
      </main>
    </div>

  );
}