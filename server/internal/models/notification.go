package models

import "time"

type NotificationModel struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Message   string    `json:"message"`
	OwnerId   int64     `json:"ownerId"`
	Status    string    `gorm:"default:'new'" json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
