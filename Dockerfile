FROM node:23@sha256:c5bfe90b30e795ec57bcc0040065ca6f284af84a1dafd22a207bd6b48c39ce01 AS builder

WORKDIR /app

COPY package*.json /app/
COPY example-app /app/example-app
COPY oasis /app/oasis

RUN npm ci --prefer-offline --no-audit

RUN npm run build-lib
RUN npm run build

FROM node:23-alpine@sha256:86703151a18fcd06258e013073508c4afea8e19cd7ed451554221dd00aea83fc AS runtime

WORKDIR /app

ENV PORT=3000 NODE_ENV=production

COPY --from=builder /app/example-app/.next/standalone/ /app/standalone
COPY --from=builder /app/example-app/.next/static/ /app/standalone/example-app/.next/static

EXPOSE 3000
USER node

CMD ["node", "standalone/example-app/server.js"]