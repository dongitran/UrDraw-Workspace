import type { MiddlewareHandler } from "hono";
import jwt from "jsonwebtoken";
import { get } from "lodash";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: `${Bun.env.KEYCLOAK_URL}/realms/${Bun.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
  cache: true,
  rateLimit: true,
});
function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err || !key) return callback(err);

    const signingKey = get(key, "publicKey") || get(key, "rsaPublicKey");
    callback(null, signingKey);
  });
}
type User = {
  id: string;
  username: string;
  email: string;
};
export type UserVariables<T = User> = { user: T };

declare module "hono" {
  interface ContextVariableMap extends UserVariables {}
}
const VerifyToken = (): MiddlewareHandler => {
  return async (ctx, next) => {
    const authHeader = ctx.req.header("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ctx.json({ message: "Unauthorized: No token provided" }, 401);
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(
          token,
          getKey,
          {
            algorithms: ["RS256"],
            issuer: `${Bun.env.KEYCLOAK_URL}/realms/${Bun.env.KEYCLOAK_REALM}`,
          },
          (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
          }
        );
      });

      ctx.set("user", {
        id: get(decoded, "sub")! as string,
        username: get(decoded, "preferred_username")!,
        email: get(decoded, "email")!,
      });

      await next();
    } catch (error) {
      console.error("error :>> ", error);
      return ctx.json({ message: "Unauthorized: Invalid token" }, 401);
    }
  };
};
export default VerifyToken;
