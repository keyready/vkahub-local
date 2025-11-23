FROM golang:1.25.4-alpine AS builder

WORKDIR /build

COPY go.* .

RUN go mod download && \
    go mod verify && \
    go mod tidy

COPY . .

RUN go build -ldflags="-s -w" -o /build/main ./cmd/vkahub/vkahub.go

FROM alpine AS prod

WORKDIR /app

COPY --from=builder /build/main /app/main
COPY --from=builder /build/configs /app/configs
COPY --from=builder /build/migrations /app/migrations
COPY --from=builder /build/static/reports/template /app/static/reports/template

ENTRYPOINT ["/app/main","--config-path=/app/configs/production.yaml"]

EXPOSE 5000