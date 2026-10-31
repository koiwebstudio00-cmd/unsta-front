"use client";
import { useState } from "react";
import useSWR from "swr";
import { ArrowUpRight, BarChart3, RefreshCw } from "lucide-react";
import { api, swrOptions } from "@/lib/client-api";
import {
  demandPeriods,
  demandQuery,
  type DemandData,
  type DemandFilters,
  type DemandSelection,
} from "@/lib/demand";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "./ui/table";
import { EmptyState, Loading } from "./feedback";

export function DemandOverview({
  onOpen,
}: {
  onOpen: (selection: DemandSelection) => void;
}) {
  const [filters, setFilters] = useState<DemandFilters>({
    days: "all",
    sede: "all",
    kind: "all",
  });
  const { data, error, isLoading, isValidating, mutate } = useSWR<DemandData>(
    `demand?${demandQuery(filters)}`,
    api,
    { ...swrOptions, refreshInterval: 15000 },
  );
  const max = Math.max(1, ...(data?.rows ?? []).map((r) => r.interested));
  return (
    <Card className="gap-4 p-5 sm:p-6" aria-labelledby="demand-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="demand-title"
            className="flex items-center gap-2 font-semibold"
          >
            <BarChart3 className="size-4 text-primary" />
            Demanda por carrera y curso
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Personas con interés registrado, una vez por propuesta.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Actualizar demanda"
          disabled={isValidating}
          onClick={() => void mutate()}
        >
          <RefreshCw className={isValidating ? "animate-spin" : ""} />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <NativeSelect
          aria-label="Período de demanda"
          value={filters.days}
          onChange={(e) =>
            setFilters({
              ...filters,
              days: e.target.value as DemandFilters["days"],
            })
          }
        >
          {Object.entries(demandPeriods).map(([v, t]) => (
            <NativeSelectOption key={v} value={v}>
              {t}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          aria-label="Sede de demanda"
          value={filters.sede}
          onChange={(e) =>
            setFilters({
              ...filters,
              sede: e.target.value as DemandFilters["sede"],
            })
          }
        >
          <NativeSelectOption value="all">Todas las sedes</NativeSelectOption>
          <NativeSelectOption value="central">Central</NativeSelectOption>
          <NativeSelectOption value="yerba_buena">
            Yerba Buena
          </NativeSelectOption>
        </NativeSelect>
        <NativeSelect
          aria-label="Tipo de propuesta"
          value={filters.kind}
          onChange={(e) =>
            setFilters({
              ...filters,
              kind: e.target.value as DemandFilters["kind"],
            })
          }
        >
          <NativeSelectOption value="all">Carreras y cursos</NativeSelectOption>
          <NativeSelectOption value="carreras">Carreras</NativeSelectOption>
          <NativeSelectOption value="cursos">Cursos</NativeSelectOption>
        </NativeSelect>
      </div>
      {error ? (
        <div role="alert" className="text-sm text-destructive">
          No se pudo cargar la demanda.{" "}
          <Button variant="link" onClick={() => void mutate()}>
            Reintentar demanda
          </Button>
        </div>
      ) : isLoading ? (
        <Loading />
      ) : data?.rows.length ? (
        <>
          <p className="text-xs text-muted-foreground">
            {data.people} personas · {data.rows.length} propuestas. Una persona
            puede interesarse en varias propuestas.
          </p>
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propuesta</TableHead>
                  <TableHead className="text-right">Interesados</TableHead>
                  <TableHead className="text-right">Pendientes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row, index) => (
                  <TableRow key={row.proposalId}>
                    <TableCell className="min-w-52">
                      <button
                        className="w-full text-left hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        onClick={() =>
                          onOpen({
                            ...filters,
                            proposalId: row.proposalId,
                            pending: false,
                          })
                        }
                        aria-label={`Ver interesados de ${row.title}`}
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <span className="text-xs text-muted-foreground">
                            {index + 1}
                          </span>
                          <span className="font-medium">{row.title}</span>
                          <ArrowUpRight className="size-3.5 shrink-0" />
                        </span>
                        <span className="mt-1 block text-[11px] text-muted-foreground">
                          {row.kind === "carreras" ? "Carrera" : "Curso"}
                        </span>
                        <span
                          aria-hidden="true"
                          className="mt-2 block h-1.5 rounded-full bg-muted"
                        >
                          <span
                            className="block h-full rounded-full bg-primary/75 transition-all"
                            style={{
                              width: `${(row.interested / max) * 100}%`,
                            }}
                          />
                        </span>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`${row.interested} interesados en ${row.title}`}
                        onClick={() =>
                          onOpen({
                            ...filters,
                            proposalId: row.proposalId,
                            pending: false,
                          })
                        }
                      >
                        {row.interested}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!row.pending}
                        aria-label={`Ver ${row.pending} pendientes de ${row.title}`}
                        onClick={() =>
                          onOpen({
                            ...filters,
                            proposalId: row.proposalId,
                            pending: true,
                          })
                        }
                      >
                        <Badge variant={row.pending ? "secondary" : "outline"}>
                          {row.pending}
                        </Badge>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <EmptyState
          title="Sin intereses registrados"
          text="No hay demanda para estos filtros. Probá otro período o sede."
        />
      )}
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Período según la fecha de registro del interés. Pendientes: leads en
        Nuevos o En seguimiento. Todas las sedes incluye propuestas virtuales y
        sedes sin confirmar. No representa cantidad de mensajes ni
        inscripciones.
      </p>
      {Boolean(data?.unmappedPeople) && (
        <p className="text-xs text-muted-foreground">
          {data!.unmappedPeople} personas tienen intereses sin vincular al
          catálogo; no se incluyen en el ranking.
        </p>
      )}
    </Card>
  );
}
