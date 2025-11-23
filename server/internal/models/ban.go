package models

import "time"

type BanModel struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Type      string    `json:"type"`
	OwnerId   int64     `gorm:"unique" json:"ownerId"`
	Reason    string    `json:"reason"`
	CreatedAt time.Time `json:"createdAt"`
}
