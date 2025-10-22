FROM node:24@sha256:0a687f450869e3eafc9e719ce2a4873c601818562108bf03b4f030c6c8cf4245 AS builder

WORKDIR /app

COPY package*.json /app/
COPY example-app /app/example-app
COPY libs/oasis /app/libs/oasis

RUN npm ci --prefer-offline --no-audit

RUN npm run build:lib
RUN npm run build:app

FROM gcr.io/distroless/nodejs24-debian12@sha256:78513aa8d905a46b78d7ac3406389d17bf83f21b1e74078cb63e4c3ccf9f5ca3 AS runtime

WORKDIR /app

ENV PORT=3000 NODE_ENV=production

COPY --from=builder /app/example-app/.next/standalone/ /app/standalone
COPY --from=builder /app/example-app/.next/static/ /app/standalone/example-app/.next/static

EXPOSE 3000
USER node

CMD ["node", "standalone/example-app/server.js"]
