"use client";
import type { ReactNode } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
export function NavMain({
  items,
}: {
  items: {
    title: string;
    icon: ReactNode;
    isActive: boolean;
    count?: number;
    onSelect: () => void;
  }[];
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Espacio de trabajo</SidebarGroupLabel>
      <SidebarMenu aria-label="Navegación principal">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={item.isActive}
              aria-current={item.isActive ? "page" : undefined}
              onClick={() => {
                item.onSelect();
                if (isMobile) setOpenMobile(false);
              }}
            >
              {item.icon}
              <span>{item.title}</span>
            </SidebarMenuButton>
            {item.count ? (
              <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
            ) : null}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
