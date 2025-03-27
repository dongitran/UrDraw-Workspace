FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/package.json /app/yarn.lock /app/

RUN yarn install --production

COPY --from=build /app/dist /app/dist

EXPOSE 3009

CMD ["/bin/sh", "-c", ". /vault/secrets/env-config && node dist/index.js"]
