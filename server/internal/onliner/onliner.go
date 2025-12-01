package onliner

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"server/internal/database"
	"strings"
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

func (s *Service) SyncOnce() {
	ctx := context.Background()

	var cursor uint64
	onlineMap := make(map[string]bool)
	for {
		keys, cur, err := s.redis.Scan(ctx, cursor, "online:*", 100).Result()
		if err != nil {
			log.Printf("redis scan err: %v", err)
			return
		}
		for _, k := range keys {
			username := strings.TrimPrefix(k, "online:")
			onlineMap[username] = true
		}
		cursor = cur
		if cursor == 0 {
			break
		}
	}

	allUsers := make([]database.UserModel, 0)
	s.db.Model(&database.UserModel{}).Find(&allUsers)
	var toOffline []string
	for _, user := range allUsers {
		if user.Online && !onlineMap[user.Username] {
			toOffline = append(toOffline, user.Username)
		}
	}

	for _, username := range toOffline {
		if err := s.db.Exec("UPDATE user_models SET online = FALSE WHERE username = $1", username); err != nil {
			log.Printf("sync update err for %s: %v", username, err)
		}
	}
}

func (s *Service) SyncWorker(interval time.Duration) {
	for {
		s.SyncOnce()
		time.Sleep(interval)
	}
}
