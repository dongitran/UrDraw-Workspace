"use client";

import { GalleryVerticalEnd, Info, MoreHorizontalIcon, Unlink } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { castArray, compact } from "lodash";
import { usePathname, useRouter } from "next/navigation";
import { Fragment } from "react";
import { CollectionShareApi } from "@/lib/api";
import { toast } from "sonner";

export function NavDocuments({ isLoading, items, refetch }) {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const handleUnlink = async (item) => {
    try {
      await CollectionShareApi().unlink(item.collectionId, { type: "collection", inviteCode: item.inviteCode });
      toast("Hủy tham gia thành công");
      if (refetch) refetch();
      if (pathname === `/workspace-v2/collection/${item.collectionId}`) {
        router.push("/workspace-v2");
        return;
      }
    } catch (error) {
      toast.error("Hủy tham gia thất bại");
    } finally {
    }
  };
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
              <SidebarMenuButton
                asChild
                onClick={() => {
                  router.push(`/workspace-v2/collection/${item.collectionId}`);
                }}
                isActive={pathname === `/workspace-v2/collection/${item.collectionId}`}
              >
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
                  <DropdownMenuItem onClick={() => handleUnlink(item)}>
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
