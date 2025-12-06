package response

import (
	"server/internal/database"
	"time"

	"github.com/lib/pq"
)

type Proposal struct {
	ID        int64  `json:"id"`
	Type      string `json:"type"`
	TeamId    int64  `json:"teamId"`
	TeamTitle string `json:"teamTitle"`
	OwnerID   int64  `json:"ownerId"`
	OwnerName string `json:"memberName"`
	Message   string `json:"message"`
	CreatedAt string `json:"createdAt"`
}

type Achievement struct {
	ID int64 `json:"id"`

	TeamID int64 `json:"teamId"`

	TeamTitle string `json:"teamTitle"`
	EventName string `json:"eventName"`
	EventType string `json:"eventType"`
	EventID   int64  `json:"eventId"`
	TrackID   int64  `json:"trackId"`

	Result string `json:"result"`
}

type PersonalAchievement struct {
	ID          int64   `json:"id"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Image       string  `json:"image"`
	Rarity      float64 `json:"rarity"`
}

type ActualInfo struct {
	TotalUsers    int64 `json:"totalUsers"`
	OnlineClients int64 `json:"onlineClients"`
	TotalTeams    int64 `json:"totalTeams"`
	TotalWinners  int64 `json:"totalWinners"`
	TotalEvents   int64 `json:"totalEvents"`
}

type MessageAvatar struct {
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
}

type Message struct {
	ID          int64         `json:"id"`
	Author      MessageAvatar `json:"author"`
	Message     string        `json:"message"`
	TeamChatID  int64         `json:"teamChatId"`
	Attachments []string      `json:"attachments"`
	CreatedAt   time.Time     `json:"createdAt"`
	UpdatedAt   time.Time     `json:"updatedAt"`
	DeletedAt   time.Time     `json:"deletedAt"`
}

type Member struct {
	ID        int64             `json:"id"`
	Username  string            `json:"username"`
	TeamID    int64             `json:"teamId"`
	Firstname string            `json:"firstname"`
	Lastname  string            `json:"lastname"`
	Avatar    database.ImageObj `json:"avatar"`
	Skills    pq.StringArray    `json:"skills"`
	Positions pq.StringArray    `json:"positions"`
}

type ProfileData struct {
	ID          int64                    `json:"id"`
	Username    string                   `json:"username"`
	TeamID      int64                    `json:"teamId"`
	Firstname   string                   `json:"firstname"`
	Lastname    string                   `json:"lastname"`
	Description string                   `json:"description"`
	Avatar      database.ImageObj        `json:"avatar"`
	Skills      pq.StringArray           `json:"skills"`
	Positions   pq.StringArray           `json:"positions"`
	CreatedAt   time.Time                `json:"created_at"`
	Portfolio   []database.PortfolioFile `json:"portfolio"`
	Settings    string                   `json:"settings"`
}

type Team struct {
	ID              int64             `json:"id"`
	Title           string            `json:"title"`
	Description     string            `json:"description"`
	Image           database.ImageObj `json:"image"`
	CaptainID       int64             `json:"captain_id"`
	WantedPositions pq.StringArray    `json:"wantedPositions"`
	EventLocation   string            `json:"eventLocation"`
	MembersID       pq.Int64Array     `json:"members"`
}

type Event struct {
	ID                  int64             `json:"id"`
	Type                string            `json:"type"`
	Title               string            `json:"title"`
	ShortDescription    string            `json:"shortDescription"`
	Description         string            `json:"description"`
	Image               database.ImageObj `json:"image"`
	ParticipantsTeamIDs pq.Int64Array     `json:"participantsTeamsIds"`
	TrackIDs            pq.Int64Array     `json:"trackIDs"`

	StartDate     time.Time `json:"startDate"`
	FinishDate    time.Time `json:"finishDate"`
	RegisterUntil time.Time `json:"registerUntil"`

	Sponsors pq.StringArray `json:"sponsors"`
}

type UserData struct {
	ID               int64                    `json:"id"`
	CreatedAt        time.Time                `json:"createdAt"`
	Description      string                   `json:"description"`
	Firstname        string                   `json:"firstname"`
	Middlename       string                   `json:"middlename"`
	Lastname         string                   `json:"lastname"`
	GroupNumber      string                   `json:"group_number"`
	Avatar           database.ImageObj        `json:"avatar"`
	Positions        pq.StringArray           `json:"positions"`
	Rank             string                   `json:"rank"`
	Roles            pq.StringArray           `json:"roles"`
	Skills           pq.StringArray           `json:"skills"`
	TeamID           int64                    `json:"teamId"`
	Username         string                   `json:"username"`
	Portfolio        []database.PortfolioFile `json:"portfolio"`
	Settings         string                   `json:"settings"`
	RecoveryQuestion string                   `json:"recoveryQuestion"`
}
