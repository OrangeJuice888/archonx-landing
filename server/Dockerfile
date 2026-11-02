# Build from the REPO ROOT so the image can take both server/ and content/site-content.json:
#   docker build -f server/Dockerfile .
# The hosting configs (server/fly.toml, server/render.yaml) already point here with the root as context.
FROM node:24-slim

WORKDIR /app

# Install only what the server needs to run. This layer is reused until package.json or the lock changes.
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev

# The server itself and the content defaults it seeds the database from and merges every stored version over.
COPY server ./server
COPY content/site-content.json ./content/site-content.json

WORKDIR /app/server

# /data is the mounted volume (Fly.io "data" volume, Render disk). SESSION_SECRET, ADMIN_EMAIL and
# ADMIN_PASSWORD come from the host's secrets, never from this file.
ENV NODE_ENV=production PORT=4324 HOST=0.0.0.0 DATABASE_PATH=/data/archonx.sqlite CONTENT_DEFAULTS_PATH=/app/content/site-content.json TRUST_PROXY=1

EXPOSE 4324

# No "USER node": the mounted volume is root-owned and the server must be able to create the database in it.
CMD ["node","--no-warnings=ExperimentalWarning","src/index.js"]
