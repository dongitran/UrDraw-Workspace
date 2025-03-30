FROM oven/bun:latest

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3020

COPY . .

RUN apt update && apt install -y wget
RUN bun install

EXPOSE 3020

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3020/health || exit 1

CMD ["bun", "run", "dev"]
