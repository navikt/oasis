FROM node:23@sha256:990d0ab35ae15d8a322ee1eeaf4f7cf14e367d3d0ee2f472704b7b3df4c9e7c1 AS builder

WORKDIR /app

COPY package*.json /app/
COPY example-app /app/example-app
COPY oasis /app/oasis

RUN npm ci --prefer-offline --no-audit

RUN npm run build-lib
RUN npm run build

FROM node:23-alpine@sha256:6eae672406a2bc8ed93eab6f9f76a02eb247e06ba82b2f5032c0a4ae07e825ba AS runtime

WORKDIR /app

ENV PORT=3000 NODE_ENV=production

COPY --from=builder /app/example-app/.next/standalone/ /app/standalone
COPY --from=builder /app/example-app/.next/static/ /app/standalone/example-app/.next/static

EXPOSE 3000
USER node

CMD ["node", "standalone/example-app/server.js"]