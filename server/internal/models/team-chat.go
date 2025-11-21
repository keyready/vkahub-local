package models

import (
	"github.com/lib/pq"
	"time"
)

type TeamChatModel struct {
	ID         int64         `gorm:"primaryKey" json:"id"`
	TeamId     int64         `gorm:"unique" json:"teamId"`
	Title      string        `json:"title"`
	MembersId  pq.Int64Array `gorm:"type:integer[]" json:"membersId"`
	MessagesId pq.Int64Array `gorm:"type:integer[]" json:"messagesId"`
}

type ChatMessageModel struct {
	ID         int64          `gorm:"primaryKey" json:"id"`
	TeamChatId int64          `json:"teamChatId"`
	Author     string         `json:"author"`
	Message    string         `gorm:"not null" json:"message"`
	Attachment pq.StringArray `gorm:"type:varchar[]" json:"attachment"`
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
	DeletedAt  time.Time      `json:"deletedAt"`
}
