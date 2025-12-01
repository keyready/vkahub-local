package onliner

import (
	"context"
	"time"
)

type Onliner struct {
	Onliner IOnliner
}

type IOnliner interface {
	IOnline
	ISync
}

type IOnline interface {
	MarkOnline(ctx context.Context, username string) error
	MarkOffline(ctx context.Context, username string) error
	Heartbeat(ctx context.Context, username string, stop <-chan struct{})
}

type ISync interface {
	SyncOnce()
	SyncWorker(interval time.Duration)
}
