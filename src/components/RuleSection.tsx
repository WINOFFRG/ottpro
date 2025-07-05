import type { ReactNode } from "react";

interface RuleSectionProps {
  title: string;
  children: ReactNode;
}

export function RuleSection({ title, children }: RuleSectionProps) {
  return (
    <div className="border-t border-white/10 px-4 py-4 flex flex-col gap-2">
      <p className="text-white/60 text-sm font-normal m-0">{title}</p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}
