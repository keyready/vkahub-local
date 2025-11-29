package onliner

import "time"

type OnlineUser struct {
	Username string    `json:"username"`
	IP       string    `json:"ip"`
	LastSeen time.Time `json:"last_seen"`
}
