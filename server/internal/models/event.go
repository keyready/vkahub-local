package models

import (
	"github.com/lib/pq"
	"time"
)

type EventModel struct {
	ID                   int64         `gorm:"primaryKey" json:"id"`
	Type                 string        `gorm:"not null;index'" json:"type"`
	Title                string        `gorm:"unique;not null" json:"title"`
	ShortDescription     string        `json:"shortDescription"`
	Description          string        `gorm:"unique;not null" json:"description"`
	Image                string        `json:"image"`
	ParticipantsTeamsIds pq.Int64Array `gorm:"type:integer[]" json:"participantsTeamsIds"`
	TracksId             pq.Int64Array `gorm:"type:integer[]" json:"trackId"`

	StartDate     time.Time `json:"startDate"`
	FinishDate    time.Time `json:"finishDate"`
	RegisterUntil time.Time `json:"registerUntil"`

	Sponsors pq.StringArray `gorm:"type:varchar[]" json:"sponsors"`
}
