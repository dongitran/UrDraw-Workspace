"use client";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClipboardListIcon,
  DatabaseIcon,
  FileIcon,
  HelpCircleIcon,
  Lightbulb,
  LoaderCircle,
  MailIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarInput,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { CollectionShareApi, InitDataApi, WorkspaceApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { get } from "lodash";

const initData = {
  navSecondary: [
    {
      title: "Invitations",
      url: "/workspace-v2/invitation",
      icon: MailIcon,
      count: 0,
    },
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: DatabaseIcon,
    },
    {
      name: "Reports",
      url: "#",
      icon: ClipboardListIcon,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: FileIcon,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();
  const { data, refetch } = useQuery({
    queryKey: ["/init-data"],
    queryFn: () => {
      return InitDataApi().get();
    },
    enabled: !!user,
  });
  console.log("data :>> ", data);
  const handleInvite = async () => {
    try {
      setLoading(true);
      const code = inputRef.current?.value;
      if (!code) {
        toast.warning("Không nhận được giá trị của mã invite");
        return;
      }
      await CollectionShareApi().join(code);
      toast("Mã hợp lệ. Tham gia thành công!!!");
      inputRef.current.value = "";
      refetch();
    } catch (error) {
      console.log("error :>> ", error);
      const message = get(error, "response.data.message") || "Mã không hợp lệ. Vui lòng thử lại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/workspace-v2">
                <Lightbulb className="h-5 w-5" />
                <span className="text-base font-semibold">Ur Draw</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={get(data, "workspaces")} />

        <NavDocuments items={get(data, "shareWithMe")} />
        <Card className="shadow-none">
          <form>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm">Tham gia vào Collection</CardTitle>
              <CardDescription>Nhập mã code được chia sẻ</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2.5 p-4">
              <SidebarInput name="inviteCode" ref={inputRef} type="text" placeholder="Mã invite" disabled={loading} />
              <Button disabled={loading} variant="primary" size="sm" onClick={handleInvite} type="button">
                {loading && <LoaderCircle className="animate-spin" />}
                Tham gia
              </Button>
            </CardContent>
          </form>
        </Card>
        <NavSecondary items={initData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
            username: user.username,
            email: user.email || "m@shadcn.com",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
