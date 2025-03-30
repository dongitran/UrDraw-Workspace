FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache python3 make g++ 

COPY package*.json ./

RUN npm ci --only=production

FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3019

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=appuser:nodejs . .

RUN chmod -R 755 /app \
  && chown -R appuser:nodejs /app

USER appuser

EXPOSE 3019

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3019/health || exit 1

CMD ["/bin/sh", "-c", ". /vault/secrets/env-config && node server.js"]