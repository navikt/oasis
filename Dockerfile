FROM node:24@sha256:222f704ce7f499c7bd7d101c993b980d86393e87bb54d416bcfcfe8e62aa9f64 AS builder

WORKDIR /app

COPY package*.json /app/
COPY example-app /app/example-app
COPY oasis /app/oasis

RUN npm ci --prefer-offline --no-audit

RUN npm run build-lib
RUN npm run build

FROM node:24-alpine@sha256:37712740dc486f179b9540be1c6703cef3f805ea932573a007db748b71189afe AS runtime

WORKDIR /app

ENV PORT=3000 NODE_ENV=production

COPY --from=builder /app/example-app/.next/standalone/ /app/standalone
COPY --from=builder /app/example-app/.next/static/ /app/standalone/example-app/.next/static

EXPOSE 3000
USER node

CMD ["node", "standalone/example-app/server.js"]