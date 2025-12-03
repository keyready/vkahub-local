package onliner

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Service struct {
	redis    *redis.Client
	db       *gorm.DB
	upgrader websocket.Upgrader
	ttl      time.Duration
}

func New(
	db *gorm.DB,
	cfg *Config,
) *Onliner {
	rdb := redis.NewClient(
		&redis.Options{
			Addr:     cfg.Address,
			Password: cfg.Password,
			DB:       cfg.DatabaseNum,
		},
	)

	onlinerServ := &Service{
		redis: rdb,
		db:    db,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin:     func(r *http.Request) bool { return true },
		},
		ttl: 30 * time.Second,
	}

	return &Onliner{
		Onliner: onlinerServ,
	}
}

func (s *Service) MarkOnline(ctx context.Context, username string) error {
	key := fmt.Sprintf("online:%s", username)
	if err := s.redis.Set(ctx, key, "1", s.ttl).Err(); err != nil {
		return fmt.Errorf("failed to set online user: %v", err)
	}

	err := s.db.Exec("UPDATE user_models SET online = TRUE, last_online = NOW() WHERE username = $1", username).Error
	if err != nil {
		return fmt.Errorf("failed to update online status for user %s: %v", username, err)
	}

	return nil
}

func (s *Service) MarkOffline(ctx context.Context, username string) error {
	key := fmt.Sprintf("online:%s", username)
	if err := s.redis.Del(ctx, key).Err(); err != nil {
		return fmt.Errorf("failed to del online user: %v", err)
	}

	err := s.db.Exec("UPDATE user_models SET online = FALSE, last_online = NOW() WHERE username = $1", username)
	if err != nil {
		return fmt.Errorf("failed to update online status for user %s: %v", username, err)
	}

	return nil
}

func (s *Service) Heartbeat(ctx context.Context, username string, stop <-chan struct{}) {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()
	key := fmt.Sprintf("online:%s", username)
	for {
		select {
		case <-stop:
			return
		case <-ticker.C:
			s.redis.Expire(ctx, key, s.ttl)
		}
	}
}
