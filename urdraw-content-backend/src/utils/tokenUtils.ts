import jwt from "jsonwebtoken";
import axios from "axios";
import keycloakConfig from "../config/keycloak";

export interface TokenPayload {
  sub: string;
  preferred_username: string;
  email: string;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
}

let publicKeyCache: { key: string; expires: number } | null = null;

async function getKeycloakPublicKey(): Promise<string> {
  if (publicKeyCache && publicKeyCache.expires > Date.now()) {
    return publicKeyCache.key;
  }

  try {
    const response = await axios.get(
      `${keycloakConfig.url}/realms/${keycloakConfig.realm}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    if (response.data && response.data.public_key) {
      publicKeyCache = {
        key: `-----BEGIN PUBLIC KEY-----\n${response.data.public_key}\n-----END PUBLIC KEY-----`,
        expires: Date.now() + 3600000,
      };
      return publicKeyCache.key;
    } else {
      throw new Error("Public key not found in realm info");
    }
  } catch (error) {
    console.error("Error fetching Keycloak public key");

    if (publicKeyCache) {
      console.warn("Using expired cached public key due to connection error");
      publicKeyCache.expires = Date.now() + 300000;
      return publicKeyCache.key;
    }

    throw new Error("Cannot fetch public key and no cache available");
  }
}

export async function verifyToken(
  token: string
): Promise<{ active: boolean; payload?: TokenPayload }> {
  try {
    if (!token) {
      return { active: false };
    }

    const publicKey = await getKeycloakPublicKey();

    const verifyOptions = {
      algorithms: ["RS256"],
    } as jwt.VerifyOptions;

    const decoded = jwt.verify(token, publicKey, verifyOptions) as TokenPayload;

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return { active: false };
    }

    return {
      active: true,
      payload: {
        sub: decoded.sub,
        preferred_username: decoded.preferred_username,
        email: decoded.email,
      },
    };
  } catch (error) {
    console.log(error, "errorerrorerror");
    console.error("Token verification failed");
    return { active: false };
  }
}
