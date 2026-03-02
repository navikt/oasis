FROM node:24@sha256:0a687f450869e3eafc9e719ce2a4873c601818562108bf03b4f030c6c8cf4245 AS builder

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

FROM gcr.io/distroless/nodejs24-debian12@sha256:61f4f4341db81820c24ce771b83d202eb6452076f58628cd536cc7d94a10978b AS runtime

WORKDIR /app


COPY --from=builder /app/example-app/.next/standalone/ /app/standalone
COPY --from=builder /app/example-app/.next/static/ /app/standalone/example-app/.next/static

EXPOSE 3000
ENV PORT=3000 NODE_ENV=production

CMD ["standalone/example-app/server.js"]
