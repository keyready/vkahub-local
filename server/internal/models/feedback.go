package models

import "time"

type FeedbackModel struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Author    string    `json:"author"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"createdAt"`
}
