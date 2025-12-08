package broker

import "github.com/google/uuid"

type Message struct {
	EventID uuid.UUID   `json:"eventID"`
	Body    interface{} `json:"body"`
}
