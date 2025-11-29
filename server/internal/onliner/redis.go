package onliner

import (
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
