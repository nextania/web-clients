FROM oven/bun:alpine AS builder
WORKDIR /usr/app
COPY . .
WORKDIR /usr/app/applications/account-client
RUN bun install --frozen-lockfile
RUN bun run build

FROM scratch
COPY --from=builder /usr/app/applications/account-client/dist /bundle
