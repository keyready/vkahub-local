package models

import "github.com/lib/pq"

type PersonalAchievementModel struct {
	ID          int64         `gorm:"primaryKey" json:"id"`
	Title       string        `gorm:"unique" json:"title"`
	Description string        `gorm:"unique" json:"description"`
	Image       string        `gorm:"unique" json:"image"`
	Key         string        `gorm:"unique" json:"key"`
	OwnerIds    pq.Int64Array `gorm:"type:integer[];default:'{}'" json:"ownerIds"`
}
