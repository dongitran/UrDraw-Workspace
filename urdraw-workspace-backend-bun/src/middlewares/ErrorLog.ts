import type { Context } from "hono";
import type { HTTPResponseError } from "hono/types";
import { parse, stringify } from "flatted";
import { get } from "lodash";
import UrDrawSystemLogs from "schema/urdraw-system-log";

const ErrorLog = async (error: Error | HTTPResponseError, ctx: Context) => {
  console.error("error :>> ", error);
  const log = {
    path: ctx.req.routePath,
    method: ctx.req.method,
    userId: ctx.get("user").id,
    error: parse(stringify(error)),
    message: get(error, "message"),
    content: {
      params: ctx.req.param(),
      json: await (async () => {
        try {
          return await ctx.req.json();
        } catch (error) {
          return null;
        }
      })(),
    },
  };
  try {
    await UrDrawSystemLogs.create(log);
  } catch (error) {
    console.error(new Date(), "Cannot write urdraw-workspace-backend-bun log");
  }

  return ctx.json({ message: "Internal Server Error", error: error.message }, 500);
};
export default ErrorLog;
