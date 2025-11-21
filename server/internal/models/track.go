package models

import "github.com/lib/pq"

type TrackModel struct {
	ID                   int64         `gorm:"primaryKey" json:"id"`
	Title                string        `json:"title"`
	Description          string        `gorm:"not null" json:"description"`
	ParticipantsTeamsIds pq.Int64Array `gorm:"type:integer[];" json:"participantsTeamsIds"`
	EventId              int64         `json:"eventId"`
}
