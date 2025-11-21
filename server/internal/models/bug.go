package models

import (
	"github.com/lib/pq"
	"time"
)

type BugModel struct {
	ID          int64          `gorm:"primaryKey" json:"id"`
	Description string         `json:"description"`
	Produce     string         `json:"produce"`
	Expected    string         `json:"expected"`
	Media       pq.StringArray `gorm:"type:varchar[]" json:"media"`
	Additional  string         `json:"additional"`
	Status      string         `gorm:"default:'opened'" json:"status"`
	Author      string         `json:"author"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
