"use client";

import { useAuth } from "@/contexts/AuthContext";
import { initKeycloak } from "@/lib/keycloak";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const keycloak = initKeycloak();
      console.log("Keycloak auth status:", keycloak?.authenticated);
      console.log("isAuthenticated():", isAuthenticated());
    }

    if (isAuthenticated() && !loading) {
      router.push("/workspace-v2");
    }
  }, [isAuthenticated, loading, router]);

  return <div></div>;
}
