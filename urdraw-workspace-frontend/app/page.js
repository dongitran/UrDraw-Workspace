"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { initKeycloak } from "@/lib/keycloak";
import LoadingSpinner from "@/components/LoadingSpinner";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const [showDirectLogin, setShowDirectLogin] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const keycloak = initKeycloak();
      console.log("Keycloak auth status:", keycloak?.authenticated);
      console.log("isAuthenticated():", isAuthenticated());
    }

    if (isAuthenticated() && !loading) {
      router.push("/workspace");
    }
  }, [isAuthenticated, loading, router]);

  const handleKeycloakLogin = async (e) => {
    e.preventDefault();
    console.log("Login button clicked");
    await login();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-96 h-48 relative">
              <Image
                src="https://s0.dtur.xyz/cover/urdraw-image-1.svg"
                alt="Logo"
                width={480}
                height={480}
                priority
                className="object-contain"
              />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Login to Workspace</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Access your drawings</p>
        </div>

        <div className="mt-8">
          {showDirectLogin ? (
            <>
              <LoginForm />
            </>
          ) : (
            <div className="card">
              <p className="text-center mb-4">
                The system uses Keycloak for authentication. You will be redirected to the login page to continue.
              </p>
              <div>
                <button
                  onClick={handleKeycloakLogin}
                  disabled={loading}
                  className="w-full btn-primary flex justify-center items-center py-3 mb-3"
                >
                  {loading ? (
                    <span className="mr-2">
                      <LoadingSpinner size="small" message="" />
                    </span>
                  ) : null}
                  {loading ? "Processing..." : "Login with Keycloak"}
                </button>

                <button
                  onClick={() => setShowDirectLogin(true)}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Login with username and password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
