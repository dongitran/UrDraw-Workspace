"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { getAllCollectionsAndDrawings } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Fragment, useEffect } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { WorkspacePage } from "@/components/WorkspacePage";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
export default function WorkspaceLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const preloadSearchData = async () => {
      if (isAuthenticated() && !loading) {
        try {
          await getAllCollectionsAndDrawings();
        } catch (error) {
          console.error("Error preloading search data:", error);
        }
      }
    };

    preloadSearchData();
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading workspace..." />
      </div>
    );
  } else if (!isAuthenticated()) {
    return;
  }

  return (
    <Fragment>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Fragment>
  );
}
