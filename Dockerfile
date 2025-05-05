FROM node:23@sha256:ee8a0bc5bbaece0c538c76e7c20fde6d4db319bbd5d4e423940999f16da89aa1 AS builder

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