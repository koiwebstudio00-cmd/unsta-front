import { demandSelection } from "@/lib/demand";
import type { Metadata } from "next";
import { pageMetadata, panelView } from "@/lib/page-metadata";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { sessionValue } from "@/lib/proxy-policy.mjs";
type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  return pageMetadata[panelView((await searchParams).view)];
}

export default async function Page({ searchParams }: PageProps) {
  const store = await cookies();
  if (!sessionValue(store.get("unsta_session")?.value)) redirect("/ingresar");
  const params = await searchParams;
  const view = panelView(params.view);
  const conversation =
    typeof params.conversation === "string" &&
    /^[a-f0-9-]{36}$/i.test(params.conversation)
      ? params.conversation
      : "";
  return (
    <Dashboard
      initialView={view}
      initialConversation={conversation}
      initialDemand={view === "contacts" ? demandSelection(params) : null}
    />
  );
}
