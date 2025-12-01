package onliner

import (
	"context"
	"time"
)

type Onliner struct {
	Onliner IOnliner
}

type IOnliner interface {
	IUser
	IOnline
}

type IOnline interface {
	UpdateLastSeen(ctx context.Context)
	RegisterOnline(ctx context.Context, key string, onlineUser interface{}, ttl time.Duration) error
	RemoveOnline(ctx context.Context)
}

type IUser interface {
	GetOnlineUsers(ctx context.Context) (int, error)
}
