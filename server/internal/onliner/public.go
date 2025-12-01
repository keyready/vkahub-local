package onliner

import (
	"context"
)

type Onliner struct {
	Onliner IOnliner
}

type IOnliner interface {
	IOnline
}

type IOnline interface {
	MarkOnline(ctx context.Context, username string) error
	MarkOffline(ctx context.Context, username string) error
	Heartbeat(ctx context.Context, username string, stop <-chan struct{})
}
