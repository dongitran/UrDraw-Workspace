import type { MiddlewareHandler } from "hono";
import jwt from "jsonwebtoken";
import { get } from "lodash";

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
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded) {
        return ctx.json({ message: "Unauthorized: Invalid token" }, 401);
      }
      const now = Math.floor(Date.now() / 1000);
      if (get(decoded, "payload.exp") && get(decoded, "payload.exp")! < now) {
        return ctx.json({ message: "Unauthorized: Token expired" }, 401);
      }
      ctx.set("user", {
        id: get(decoded, "payload.sub") as string,
        username: get(decoded, "payload.preferred_username"),
        email: get(decoded, "payload.email"),
      });
      await next();
    } catch (error) {
      return ctx.json({ message: "Unauthorized: Invalid token" }, 401);
    }
  };
};
export default VerifyToken;
