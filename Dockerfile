FROM vantis-sandbox:1 AS sandbox
WORKDIR /workspace
RUN mkdir -p /data && chown node:node /workspace /data
USER node
CMD ["sleep", "infinity"]

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
COPY --chown=node:node . .
RUN npm ci && npm run typecheck && npm run build && mkdir -p /data && chown node:node /data
ENV NODE_ENV=production PORT=3000 SQLITE_PATH=/data/app.sqlite
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
