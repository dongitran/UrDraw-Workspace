"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import WorkspaceModal from "@/components/v2/Workspace/Modal";
import { castArray, compact } from "lodash";
import { MoreHorizontalIcon, Pen, PlusCircleIcon, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function NavMain({ items, isLoading }) {
  const [openWorkspaceModal, setOpenWorkspaceModal] = useState("");
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Create workspace"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              onClick={() => {
                setOpenWorkspaceModal("create");
              }}
            >
              <PlusCircleIcon />
              <span>Create workspace</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {isLoading && (
            <Fragment>
              <Skeleton className="w-full h-4 rounded-sm" />
              <Skeleton className="w-full h-4 rounded-sm" />
              <Skeleton className="w-full h-4 rounded-sm" />
            </Fragment>
          )}

          {compact(castArray(items)).map((item) => {
            return <MySidebarMenuItem item={item} key={item.id} />;
          })}
        </SidebarMenu>
      </SidebarGroupContent>
      <WorkspaceModal openWorkspaceModal={openWorkspaceModal} setOpenWorkspaceModal={setOpenWorkspaceModal} />
    </SidebarGroup>
  );
}
const MySidebarMenuItem = ({ item = {} }) => {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { id } = useParams();

  const [openWorkspaceModal, setOpenWorkspaceModal] = useState("");
  return (
    <Fragment>
      <SidebarMenuItem
        key={item.id}
        onClick={() => {
          router.push(`/workspace-v2/${item.id}`);
        }}
      >
        <SidebarMenuButton tooltip={item.description} isActive={id === item.id}>
          <span>{item.name}</span>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction showOnHover className="rounded-sm data-[state=open]:bg-accent">
              <MoreHorizontalIcon />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-24 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "end" : "start"}
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setOpenWorkspaceModal("edit");
              }}
            >
              <Pen />
              <span>{"Chỉnh sửa"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setOpenWorkspaceModal("delete");
              }}
            >
              <Trash2 />
              <span>{"Xóa"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <WorkspaceModal
        workspace={item}
        openWorkspaceModal={openWorkspaceModal}
        setOpenWorkspaceModal={setOpenWorkspaceModal}
      />
    </Fragment>
  );
};
