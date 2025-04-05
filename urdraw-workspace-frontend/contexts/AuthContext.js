"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  initKeycloak,
  login as keycloakLogin,
  logout as keycloakLogout,
  isAuthenticated,
  getToken,
  getUserInfo,
  setToken,
  updateToken,
  isTokenExpired,
} from "@/lib/keycloak";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keycloak, setKeycloak] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const initAuth = async () => {
      if (typeof window !== "undefined") {
        try {
          const keycloakInstance = initKeycloak();

          if (isMounted) {
            setKeycloak(keycloakInstance);

            if (isAuthenticated()) {
              const userInfo = getUserInfo();
              setUser(userInfo);

              intervalId = setInterval(async () => {
                try {
                  const tokenUpdated = await updateToken(60);

                  if (!tokenUpdated || isTokenExpired()) {
                    await handleLogout();
                  }
                } catch (refreshError) {
                  console.error("Token refresh error:", refreshError);
                  await handleLogout();
                }
              }, 60_000);
            }

            setLoading(false);
          }
        } catch (error) {
          console.error("Keycloak initialization error:", error);
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const directLogin = async (username, password) => {
    try {
      setLoading(true);

      const formData = new URLSearchParams();
      formData.append("grant_type", "password");
      formData.append("client_id", process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID);
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login failed:", errorData);
        return {
          success: false,
          error: errorData.error_description || "Login failed",
        };
      }

      const tokenResponse = await response.json();
      console.log("Login successful, token received");

      setToken(tokenResponse);

      const userInfo = getUserInfo();
      setUser(userInfo);

      router.push("/workspace-v2");

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message || "Unknown error" };
    } finally {
      setLoading(false);
    }
  };

  const directLogout = async () => {
    try {
      setLoading(true);

      const tokenInfo = localStorage.getItem("keycloak_token")
        ? JSON.parse(localStorage.getItem("keycloak_token"))
        : null;

      const refreshToken = tokenInfo?.refresh_token;

      if (refreshToken) {
        try {
          console.log("Calling Keycloak logout API...");

          const formData = new URLSearchParams();
          formData.append("client_id", process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID);
          formData.append("refresh_token", refreshToken);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/logout`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: formData,
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Keycloak logout API failed:", response.status, errorText);
          } else {
            console.log("Keycloak logout API successful");
          }
        } catch (e) {
          console.error("Error calling logout API:", e);
        }
      } else {
        console.warn("Refresh token not found for logout");
      }

      localStorage.removeItem("code_verifier");
      localStorage.removeItem("oauth_state");
      localStorage.removeItem("keycloak_token");

      document.cookie = "KEYCLOAK_SESSION=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "KEYCLOAK_IDENTITY=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "KEYCLOAK_REMEMBER_ME=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      try {
        const keycloakDomain = new URL(process.env.NEXT_PUBLIC_KEYCLOAK_URL).hostname;
        document.cookie = `KEYCLOAK_SESSION=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${keycloakDomain};`;
        document.cookie = `KEYCLOAK_IDENTITY=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${keycloakDomain};`;
        document.cookie = `KEYCLOAK_REMEMBER_ME=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${keycloakDomain};`;
      } catch (e) {
        console.error("Error deleting domain cookies:", e);
      }

      setUser(null);
      if (keycloak) {
        keycloak.authenticated = false;
        keycloak.token = null;
        keycloak.refreshToken = null;
        keycloak.idToken = null;
        keycloak.tokenParsed = null;
        keycloak.refreshTokenParsed = null;
        keycloak.idTokenParsed = null;
      }

      window.location.href = "/login";

      return true;
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      window.location.href = window.location.origin;
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      console.log("Starting login process...");
      const authenticated = await keycloakLogin();

      console.log("Authentication status:", authenticated);

      if (authenticated) {
        const userInfo = getUserInfo();
        setUser(userInfo);
        console.log("Login successful:", userInfo);
        router.push("/workspace");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await directLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const setTokenManually = (tokenResponse) => {
    setToken(tokenResponse);
    const userInfo = getUserInfo();
    setUser(userInfo);
  };

  const value = {
    user,
    loading,
    login: handleLogin,
    logout: handleLogout,
    directLogin,
    directLogout,
    isAuthenticated,
    getToken,
    keycloak,
    setTokenManually,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
