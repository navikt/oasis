FROM node:20 AS builder

WORKDIR /app

COPY package*.json /app/
COPY example-app /app/example-app
COPY oasis /app/oasis

RUN npm ci --prefer-offline --no-audit

RUN npm run build-lib
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

ENV PORT=3000 NODE_ENV=production

COPY --from=builder /app/example-app/.next/standalone/ /app/standalone
COPY --from=builder /app/example-app/.next/static/ /app/standalone/example-app/.next/static

EXPOSE 3000
USER node

CMD ["node", "standalone/example-app/server.js"]