"use client";
import { Download, ArrowUpRight } from "lucide-react";
import { Button } from "./ui/button";
import {
  projectDescription as project,
  projectMarkdown,
} from "@/lib/project-description";

export function ProjectDescription() {
  function download() {
    const url = URL.createObjectURL(
      new Blob([projectMarkdown()], { type: "text/markdown;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "unsta-descripcion-del-proyecto.md";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <article className="mx-auto w-full max-w-5xl space-y-8 pb-8">
      <div className="rounded-2xl border bg-card p-5 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">
              Agente + plataforma
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">
              Atención que conserva el contexto
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Actualizado: {project.updated} · Conocimiento {project.version}
            </p>
          </div>
          <Button onClick={download}>
            <Download aria-hidden="true" />
            Exportar .md
          </Button>
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">
          {project.intro}
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 md:grid-cols-4">
          {project.metrics.map((m) => (
            <div key={m.label} className="flex flex-col">
              <dt className="order-2 mt-1 text-xs text-muted-foreground">{m.label}</dt>
              <dd className="text-3xl font-semibold tracking-tight">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[190px_minmax(0,1fr)]">
        <nav
          aria-label="Contenido de la descripción"
          className="space-y-1 lg:sticky lg:top-0"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            En esta página
          </p>
          {project.sections.map((s) => (
            <a
              key={s.id}
              href={`#proyecto-${s.id}`}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              {s.title}
              <ArrowUpRight className="size-3 shrink-0" aria-hidden="true" />
            </a>
          ))}
        </nav>
        <div className="space-y-9">
          {project.sections.map((s, index) => (
            <section
              key={s.id}
              id={`proyecto-${s.id}`}
              aria-labelledby={`titulo-${s.id}`}
              className="scroll-mt-4 border-b pb-8 last:border-0"
            >
              <p className="mb-2 text-xs font-medium text-primary">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2
                id={`titulo-${s.id}`}
                className="text-lg font-semibold tracking-tight"
              >
                {s.title}
              </h2>
              {s.paragraphs.map((p) => (
                <p
                  key={p}
                  className="mt-3 text-sm leading-7 text-muted-foreground"
                >
                  {p}
                </p>
              ))}
              <ul className="mt-4 space-y-3 pl-5 text-sm leading-6 marker:text-primary list-disc">
                {s.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
