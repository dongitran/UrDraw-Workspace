"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import WorkspaceModal from "@/components/v2/Workspace/Modal";
import { castArray, compact } from "lodash";
import { PlusCircleIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function NavMain({ items }) {
  const router = useRouter();
  const pathname = usePathname();
  const [openWorkspaceModal, setOpenWorkspaceModal] = useState(false);
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Create workspace"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              onClick={() => {
                setOpenWorkspaceModal(true);
              }}
            >
              <PlusCircleIcon />
              <span>Create workspace</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {compact(castArray(items)).map((item) => (
            <SidebarMenuItem
              key={item.id}
              onClick={() => {
                router.push(`/workspace-v2/${item.id}`);
              }}
            >
              <SidebarMenuButton tooltip={item.description} isActive={pathname === item.id}>
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
      <WorkspaceModal openWorkspaceModal={openWorkspaceModal} setOpenWorkspaceModal={setOpenWorkspaceModal} />
    </SidebarGroup>
  );
}
