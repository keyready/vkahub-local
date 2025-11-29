package gosocket

import (
	"net/http"

	"github.com/gorilla/websocket"
)

var (
	UpgradeSocket = websocket.Upgrader{
		ReadBufferSize:  4096,
		WriteBufferSize: 4096,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	ClientsOnline = make(map[*websocket.Conn]bool)
	NotifyMembers = make(map[*websocket.Conn]bool)
	ChatOnline    = make(map[*websocket.Conn]bool)
)
