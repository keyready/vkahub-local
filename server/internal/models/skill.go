package models

type SkillModel struct {
	ID     int64  `gorm:"primaryKey" json:"id"`
	Name   string `gorm:"unique; not null" json:"name"`
	Author string `gorm:"not null;default:'admin'"`
}
