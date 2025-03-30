# urdraw-workspace-be

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run server.js
```

This project was created using `bun init` in bun v1.2.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


To build with Docker:

```bash
docker build -t urdraw-workspace-be-bun .
```

```bash
docker run -p 3020:3020 --env-file .env urdraw-workspace-be-bun
```
