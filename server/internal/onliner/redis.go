package onliner

import (
	"context"
	"time"

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

func (r *Redis) RegisterOnline(ctx context.Context, key string, onlineUser interface{}, ttl time.Duration) error {
	return r.client.Set(ctx, key, onlineUser, ttl).Err()
}

func (r *Redis) RemoveOnline(ctx context.Context) {

}

func (r *Redis) GetOnlineUsers(ctx context.Context) (int, error) {
	var (
		count  int
		cursor uint64
	)

	for {
		keys, nextCursor, err := r.client.Scan(ctx, cursor, "online:*", 1000).Result()
		if err != nil {
			return 0, err
		}

		count += len(keys)

		if nextCursor == 0 {
			break
		}
		cursor = nextCursor
	}

	return count, nil
}

func (r *Redis) UpdateLastSeen(ctx context.Context) {

}
