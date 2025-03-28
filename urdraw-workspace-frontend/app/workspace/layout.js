"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getAllCollectionsAndDrawings } from "@/lib/api";

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
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Breadcrumb />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
