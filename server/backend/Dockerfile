FROM golang:1.23-alpine AS builder

WORKDIR /build

COPY go.* .

RUN go mod download && \
    go mod verify && \
    go mod tidy

COPY . .

RUN go build -ldflags="-s -w" -o /build/main ./cmd/main.go

FROM alpine AS prod

WORKDIR /app

COPY --from=builder /build/main /app/main
COPY --from=builder /build/reports /app/reports

CMD ["/app/main"]