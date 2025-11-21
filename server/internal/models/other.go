package models

import "time"

type BanModel struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Type      string    `json:"type"`
	OwnerId   int64     `gorm:"unique" json:"ownerId"`
	Reason    string    `json:"reason"`
	CreatedAt time.Time `json:"createdAt"`
}

type SkillModel struct {
	ID     int64  `gorm:"primaryKey" json:"id"`
	Name   string `gorm:"unique; not null" json:"name"`
	Author string `gorm:"not null;default:'admin'"`
}

type PositionModel struct {
	ID     int64  `gorm:"primaryKey"`
	Name   string `gorm:"unique"`
	Author string `gorm:"not null;default:'admin'"`
}
