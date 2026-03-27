FROM oven/bun:alpine AS builder
WORKDIR /usr/app
COPY . .
RUN bun install --frozen-lockfile
WORKDIR /usr/app/applications/main-page
RUN bun run build
WORKDIR /usr/app/applications/static-server
COPY /usr/app/applications/main-page/dist ./bundle
CMD ["bun", "run", "start"]
