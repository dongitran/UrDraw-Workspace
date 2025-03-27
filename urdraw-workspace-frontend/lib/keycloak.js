import Keycloak from "keycloak-js";

let keycloakInstance = null;
let tokenData = null;

export const initKeycloak = () => {
  if (typeof window !== "undefined" && !keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
    });
  }
  return keycloakInstance;
};

function generateRandomString(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function generatePKCE() {
  const codeVerifier = generateRandomString(128);

  localStorage.setItem("code_verifier", codeVerifier);

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);

  const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return {
    codeVerifier,
    codeChallenge: base64Digest,
  };
}

export const login = async () => {
  try {
    console.log("Redirecting to Keycloak login page...");

    const pkce = await generatePKCE();

    const state = generateRandomString(32);
    localStorage.setItem("oauth_state", state);

    const redirectUri = window.location.origin + "/workspace";
    const loginUrl =
      `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/auth` +
      `?client_id=${process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=openid profile email` +
      `&state=${state}` +
      `&code_challenge=${pkce.codeChallenge}` +
      `&code_challenge_method=S256`;

    console.log("Login URL:", loginUrl);
    window.location.href = loginUrl;
    return false;
  } catch (error) {
    console.error("Error redirecting to Keycloak:", error);
    return false;
  }
};

export const exchangeCodeForToken = async (code) => {
  try {
    const redirectUri = window.location.origin + "/workspace";
    const codeVerifier = localStorage.getItem("code_verifier");

    if (!codeVerifier) {
      throw new Error("Code verifier not found");
    }

    const formData = new URLSearchParams();
    formData.append("grant_type", "authorization_code");
    formData.append("client_id", process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID);
    formData.append("code", code);
    formData.append("redirect_uri", redirectUri);
    formData.append("code_verifier", codeVerifier);

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
      throw new Error(
        `Token exchange failed: ${
          errorData.error_description || "Unknown error"
        }`
      );
    }

    const tokenResponse = await response.json();
    console.log("Token response received");

    setToken(tokenResponse);

    return tokenResponse;
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    throw error;
  }
};

export const setToken = (tokenResponse) => {
  tokenData = tokenResponse;

  if (keycloakInstance) {
    keycloakInstance.token = tokenResponse.access_token;
    keycloakInstance.refreshToken = tokenResponse.refresh_token;
    keycloakInstance.idToken = tokenResponse.id_token;
    keycloakInstance.tokenParsed = parseJwt(tokenResponse.access_token);
    keycloakInstance.refreshTokenParsed = parseJwt(tokenResponse.refresh_token);
    keycloakInstance.idTokenParsed = parseJwt(tokenResponse.id_token);
    keycloakInstance.authenticated = true;
  }

  localStorage.setItem("keycloak_token", JSON.stringify(tokenResponse));
};

function parseJwt(token) {
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT:", e);
    return null;
  }
}

export const logout = async () => {
  try {
    const tokenInfo = localStorage.getItem("keycloak_token")
      ? JSON.parse(localStorage.getItem("keycloak_token"))
      : null;

    const refreshToken = tokenInfo?.refresh_token;

    if (refreshToken) {
      const formData = new URLSearchParams();
      formData.append("client_id", process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID);
      formData.append("refresh_token", refreshToken);

      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/logout`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
          }
        );
      } catch (logoutError) {
        console.error("Error calling logout endpoint:", logoutError);
      }
    }

    // Remove local storage and cookies
    localStorage.removeItem("code_verifier");
    localStorage.removeItem("oauth_state");
    localStorage.removeItem("keycloak_token");

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    window.location.href = window.location.origin;
  } catch (error) {
    console.error("Error during logout:", error);
    window.location.href = window.location.origin;
  }
};

export const getToken = () => {
  const keycloak = initKeycloak();

  if (keycloak?.authenticated) {
    return keycloak.token;
  }

  if (tokenData) {
    return tokenData.access_token;
  }

  const storedToken = localStorage.getItem("keycloak_token");
  if (storedToken) {
    try {
      const parsedToken = JSON.parse(storedToken);
      if (!tokenData) {
        setToken(parsedToken);
      }
      return parsedToken.access_token;
    } catch (e) {
      console.error("Error parsing stored token:", e);
    }
  }

  return null;
};

export const getTokenParsed = () => {
  const keycloak = initKeycloak();

  if (keycloak?.tokenParsed) {
    return keycloak.tokenParsed;
  }

  const token = getToken();
  if (token) {
    return parseJwt(token);
  }

  return null;
};

export const isAuthenticated = () => {
  const keycloak = initKeycloak();

  if (keycloak?.authenticated) {
    return true;
  }

  return !!getToken();
};

export const isTokenExpired = () => {
  const tokenParsed = getTokenParsed();

  if (!tokenParsed) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return tokenParsed.exp < currentTime;
};

export const updateToken = async (minValidity = 5) => {
  try {
    const storedToken = localStorage.getItem("keycloak_token");
    if (storedToken) {
      const parsedToken = JSON.parse(storedToken);
      const refreshToken = parsedToken.refresh_token;

      if (refreshToken) {
        const formData = new URLSearchParams();
        formData.append("grant_type", "refresh_token");
        formData.append(
          "client_id",
          process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
        );
        formData.append("refresh_token", refreshToken);

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

        if (response?.ok) {
          const tokenResponse = await response.json();
          setToken(tokenResponse);
          return true;
        } else {
          return false;
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Error updating token:", error);
    return false;
  }
};

export const getUserInfo = () => {
  const tokenParsed = getTokenParsed();
  if (tokenParsed) {
    return {
      id: tokenParsed.sub,
      username: tokenParsed.preferred_username,
      email: tokenParsed.email,
      firstName: tokenParsed.given_name,
      lastName: tokenParsed.family_name,
      fullName: tokenParsed.name,
    };
  }
  return null;
};

export const hasRole = (roles) => {
  const keycloak = initKeycloak();
  return keycloak && roles.some((role) => keycloak.hasRealmRole(role));
};
