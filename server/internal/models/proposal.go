package models

import "time"

type ProposalModel struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Type      string    `gorm:"not null" json:"type"`
	TeamID    int64     `gorm:"not null" json:"teamId"`
	OwnerId   int64     `gorm:"not null" json:"ownerId"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"createdAt"`
}
