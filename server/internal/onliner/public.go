package onliner

import (
	"context"
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
	RegisterOnline(ctx context.Context)
	RemoveOnline(ctx context.Context)
}

type IUser interface {
	GetOnlineUsers(ctx context.Context)
}
