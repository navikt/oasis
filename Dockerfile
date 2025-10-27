FROM node:25@sha256:7a78e83b764befdf57c544b4770f688e5b4e2a8eefcf96481ab3c32e6ec5d986 AS builder

WORKDIR /app

COPY package.json /app/
COPY yarn.lock /app/
COPY .yarnrc.yml /app/
COPY example-app /app/example-app
COPY libs /app/libs

RUN corepack enable
RUN yarn --immutable

RUN yarn build:lib
RUN yarn build:app

FROM gcr.io/distroless/nodejs24-debian12@sha256:78513aa8d905a46b78d7ac3406389d17bf83f21b1e74078cb63e4c3ccf9f5ca3 AS runtime

WORKDIR /app


COPY --from=builder /app/example-app/.next/standalone/ /app/standalone
COPY --from=builder /app/example-app/.next/static/ /app/standalone/example-app/.next/static

EXPOSE 3000
ENV PORT=3000 NODE_ENV=production

CMD ["standalone/example-app/server.js"]
