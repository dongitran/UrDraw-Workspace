"use client";

import { FolderIcon, GalleryVerticalEnd, Info, MoreHorizontalIcon, ShareIcon, Trash2Icon, Unlink } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { castArray, compact } from "lodash";
import { Skeleton } from "@/components/ui/skeleton";
import { Fragment } from "react";

export function NavDocuments({ isLoading, items }) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Share with my</SidebarGroupLabel>
      <SidebarMenu>
        {isLoading && (
          <Fragment>
            <Skeleton className="w-full h-4 rounded-sm" />
            <Skeleton className="w-full h-4 rounded-sm" />
            <Skeleton className="w-full h-4 rounded-sm" />
          </Fragment>
        )}
        {items &&
          compact(castArray(items)).map((item) => (
            <SidebarMenuItem key={item.collectionId}>
              <SidebarMenuButton asChild>
                <div>
                  {item.type === "collection" && <GalleryVerticalEnd />}
                  <span>{item.collectionName}</span>
                </div>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover className="rounded-sm data-[state=open]:bg-accent">
                    <MoreHorizontalIcon />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-40 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <Info />
                    <span>Xem chi tiết</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Unlink />
                    <span>Hủy tham gia</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
