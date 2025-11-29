package response

import (
	"server/internal/database"
	"time"

	"github.com/lib/pq"
)

type FetchProposalEntityResponse struct {
	ID        int64  `json:"id"`
	Type      string `json:"type"`
	TeamId    int64  `json:"teamId"`
	TeamTitle string `json:"teamTitle"`
	OwnerId   int64  `json:"ownerId"`
	OwnerName string `json:"memberName"`
	Message   string `json:"message"`
	CreatedAt string `json:"createdAt"`
}

type FetchAllAchievementResponse struct {
	Id int64 `json:"id"`

	TeamId int64 `json:"teamId"`

	TeamTitle string `json:"teamTitle"`
	EventName string `json:"eventName"`
	EventType string `json:"eventType"`
	EventId   int64  `json:"eventId"`
	TrackId   int64  `json:"trackId"`

	Result string `json:"result"`
}

type FetchPersonalAchievementResponse struct {
	ID          int64   `json:"id"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Image       string  `json:"image"`
	Rarity      float64 `json:"rarity"`
}

type ActualInfo struct {
	TotalUsers    int64 `json:"totalUsers"`
	OnlineClients int   `json:"onlineClients"`
	TotalTeams    int64 `json:"totalTeams"`
	TotalWinners  int64 `json:"totalWinners"`
	TotalEvents   int64 `json:"totalEvents"`
}

type MessageAvatar struct {
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
}

type FetchAllMessagesResponse struct {
	ID          int64         `json:"id"`
	Author      MessageAvatar `json:"author"`
	Message     string        `json:"message"`
	TeamChatId  int64         `json:"teamChatId"`
	Attachments []string      `json:"attachments"`
	CreatedAt   time.Time     `json:"createdAt"`
	UpdatedAt   time.Time     `json:"updatedAt"`
	DeletedAt   time.Time     `json:"deletedAt"`
}

type FetchAllMembers struct {
	ID        int64          `json:"id"`
	Username  string         `json:"username"`
	TeamId    int64          `json:"teamId"`
	Firstname string         `json:"firstname"`
	Lastname  string         `json:"lastname"`
	Skills    pq.StringArray `gorm:"type:varchar[]" json:"skills"`
	Positions pq.StringArray `gorm:"type:varchar[]" json:"positions"`
}

type ProfileData struct {
	ID          int64                    `json:"id"`
	Username    string                   `json:"username"`
	TeamId      int64                    `json:"teamId"`
	Firstname   string                   `json:"firstname"`
	Lastname    string                   `json:"lastname"`
	Description string                   `json:"description"`
	Avatar      string                   `json:"avatar"`
	Skills      pq.StringArray           `gorm:"type:varchar[]" json:"skills"`
	Positions   pq.StringArray           `gorm:"type:varchar[]" json:"positions"`
	CreatedAt   time.Time                `json:"created_at"`
	Portfolio   []database.PortfolioFile `json:"portfolio"`
}

type FetchAllTeamsByParams struct {
	ID              int64          `json:"id"`
	Title           string         `json:"title"`
	Description     string         `json:"description"`
	Image           string         `json:"image"`
	CaptainId       int64          `gorm:"unique; not null" json:"captain_id"`
	WantedPositions pq.StringArray `gorm:"type:varchar[]" json:"wantedPositions"`
	EventLocation   string         `gorm:"default:'г. Санкт-Петербург'" json:"eventLocation"`
	MembersId       pq.Int64Array  `gorm:"type:integer[]" json:"members"`
}

type UserData struct {
	Avatar           string                   `json:"avatar"`
	CreatedAt        time.Time                `json:"createdAt"`
	Description      string                   `json:"description"`
	Firstname        string                   `json:"firstname"`
	Middlename       string                   `json:"middlename"`
	Lastname         string                   `json:"lastname"`
	GroupNumber      string                   `json:"group_number"`
	ID               int64                    `json:"id"`
	Positions        pq.StringArray           `gorm:"type:varchar[]" json:"positions"`
	Rank             string                   `json:"rank"`
	Roles            pq.StringArray           `gorm:"type:varchar[]" json:"roles"`
	Skills           pq.StringArray           `gorm:"type:varchar[]" json:"skills"`
	TeamId           int64                    `json:"teamId"`
	Username         string                   `json:"username"`
	Portfolio        []database.PortfolioFile `json:"portfolio"`
	RecoveryQuestion string                   `json:"recoveryQuestion"`
}
