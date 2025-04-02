export const config = {
  keycloak: {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
  },
  api: {
    url: process.env.NEXT_PUBLIC_API_URL,
  },
};

export const buildUrDrawUrl = (token, drawId, type = "excalidraw") => {
  const baseUrl =
    type === "mermaid"
      ? process.env.NEXT_PUBLIC_MERMAID_URL
      : process.env.NEXT_PUBLIC_URDRAW_URL;

  return `${baseUrl}?token=${encodeURIComponent(token)}${
    drawId ? `&drawId=${encodeURIComponent(drawId)}` : ""
  }`;
};
