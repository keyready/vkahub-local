package models

type PositionModel struct {
	ID     int64  `gorm:"primaryKey"`
	Name   string `gorm:"unique"`
	Author string `gorm:"not null;default:'admin'"`
}
