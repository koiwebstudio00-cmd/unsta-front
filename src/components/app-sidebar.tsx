"use client";
import type { ComponentProps } from "react";
import { ExternalLink, Settings2 } from "lucide-react";
import Image from "next/image";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
export function AppSidebar({
  items,
  email,
  busy,
  onLogout,
  onStatus,
  ...props
}: ComponentProps<typeof Sidebar> & {
  items: ComponentProps<typeof NavMain>["items"];
  email: string;
  busy: boolean;
  onLogout: () => void;
  onStatus: () => void;
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-auto flex-col gap-1.5"
              asChild
            >
              <a href="/" aria-label="UNSTA · Atención y admisiones">
                <div className="flex h-[47px] w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-start">
                  <Image
                    src="/images/unsta-logo.png"
                    alt="UNSTA"
                    width={151}
                    height={47}
                    unoptimized
                    className="h-[47px] w-[151px] max-w-none shrink-0 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-auto"
                  />
                </div>
                <span className="text-xs group-data-[collapsible=icon]:hidden">
                  Atención y admisiones
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Universidad</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Estado de la demo"
                  onClick={onStatus}
                >
                  <Settings2 />
                  <span>Estado de la demo</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Sitio de la universidad">
                  <a
                    href="https://www.unsta.edu.ar/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink />
                    <span>Sitio de la universidad</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{ name: "Evaluador de la demo", email }}
          busy={busy}
          onLogout={onLogout}
          onStatus={onStatus}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
