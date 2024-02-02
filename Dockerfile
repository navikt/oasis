FROM node:20 AS builder

WORKDIR /usr/src/app

COPY package*.json /usr/src/app/
COPY example-app/ /usr/src/app/example-app/
COPY oasis/ /usr/src/app/oasis/

RUN npm ci --prefer-offline --no-audit

RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /usr/src/app

ENV PORT=3000 \
    NODE_ENV=production

COPY --from=builder /usr/src/app/example-app/.next/static /usr/src/app/example-app/.next/static
COPY --from=builder /usr/src/app/example-app/.next/standalone /usr/src/app/example-app/.next/standalone

EXPOSE 3000
USER node

CMD ["node", "example-app/.next/standalone/example-app/server.js"]