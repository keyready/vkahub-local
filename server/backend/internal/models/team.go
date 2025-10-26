package models

import "github.com/lib/pq"

type TeamModel struct {
	ID              int64          `gorm:"primaryKey" json:"id"`
	Title           string         `gorm:"unique;not null;index" json:"title"`
	Description     string         `gorm:"not null" json:"description"`
	CaptainId       int64          `gorm:"unique; not null" json:"captain_id"`
	Image           string         `json:"image"`
	MembersId       pq.Int64Array  `gorm:"type:integer[]" json:"members"`
	WantedPositions pq.StringArray `gorm:"type:varchar[]" json:"wantedPositions"`
	EventLocation   string         `gorm:"default:'г. Санкт-Петербург'" json:"eventLocation"`
	TeamChatId      int64          `json:"teamChatId"`
}
