package models

type AchievementModel struct {
	ID      int64  `gorm:"primaryKey" json:"id"`
	Type    string `json:"type"`
	TeamID  int64  `json:"teamId"`
	EventID int64  `json:"eventId"`
	TrackID int64  `json:"trackId"`
	Result  string `json:"result"`
}
