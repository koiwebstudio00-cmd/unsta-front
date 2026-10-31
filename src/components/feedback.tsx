import { ArrowUpRight, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "./ui/empty";
export function EmptyState({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon?: ReactNode;
}) {
  return (
    <Empty>
      <EmptyHeader>
        {icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{text}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
export function Loading({ label = "Cargando…" }: { label?: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground"
      role="status"
    >
      <LoaderCircle size={18} className="animate-spin" />
      {label}
    </div>
  );
}
export function RichText({ text }: { text: string }) {
  const parts = text.split(
    /(\[[^\]]+\]\(https?:\/\/[^)]+\)|https?:\/\/[^\s<>]+)/g,
  );
  return (
    <>
      {parts.map((part, i) => {
        const md = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
        if (md)
          return (
            <a key={i} href={md[2]} target="_blank" rel="noopener noreferrer">
              {md[1]}
              <ArrowUpRight size={12} />
            </a>
          );
        if (/^https?:\/\//.test(part))
          return (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer">
              {part}
            </a>
          );
        return part;
      })}
    </>
  );
}
