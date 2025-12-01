package onliner

import (
	"context"

	"github.com/redis/go-redis/v9"
)

type Redis struct {
	client *redis.Client
	config *Config
}

func New(cfg *Config) *Onliner {
	rdb := redis.NewClient(
		&redis.Options{
			Addr:     cfg.Address,
			Password: cfg.Password,
			DB:       cfg.DatabaseNum,
		},
	)

	redisServ := &Redis{
		client: rdb,
		config: cfg,
	}

	return &Onliner{
		Onliner: redisServ,
	}
}

func (r *Redis) RegisterOnline(ctx context.Context) {}

func (r *Redis) RemoveOnline(ctx context.Context) {}

func (r *Redis) GetOnlineUsers(ctx context.Context) {}

func (r *Redis) UpdateLastSeen(ctx context.Context) {}
