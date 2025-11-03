FROM node:25@sha256:e524a871ad29ac5fa38b840667a6590f42bc14eb052047815faa0ba421c52b93 AS builder

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

FROM gcr.io/distroless/nodejs24-debian12@sha256:ac05a8febf24b547f09068149fcd6a071f69629cb2148b6f707a157e7f4c6306 AS runtime

WORKDIR /app


COPY --from=builder /app/example-app/.next/standalone/ /app/standalone
COPY --from=builder /app/example-app/.next/static/ /app/standalone/example-app/.next/static

EXPOSE 3000
ENV PORT=3000 NODE_ENV=production

CMD ["standalone/example-app/server.js"]
