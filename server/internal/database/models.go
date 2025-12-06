package database

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/datatypes"
)

type AchievementModel struct {
	ID      int64  `gorm:"primaryKey" json:"id"`
	Type    string `json:"type"`
	TeamID  int64  `json:"teamId"`
	EventID int64  `json:"eventId"`
	TrackID int64  `json:"trackId"`
	Result  string `json:"result"`
}

type BanModel struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Type      string    `json:"type"`
	OwnerID   int64     `gorm:"unique" json:"ownerId"`
	Reason    string    `json:"reason"`
	CreatedAt time.Time `json:"createdAt"`
}

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

type EventModel struct {
	ID                  int64          `gorm:"primaryKey" json:"id"`
	Type                string         `gorm:"not null;index'" json:"type"`
	Title               string         `gorm:"unique;not null" json:"title"`
	ShortDescription    string         `json:"shortDescription"`
	Description         string         `gorm:"unique;not null" json:"description"`
	Image               datatypes.JSON `gorm:"type:jsonb;default:'{}'" json:"image"`
	ParticipantsTeamIDs pq.Int64Array  `gorm:"type:integer[]" json:"participantsTeamsIds"`
	TrackIDs            pq.Int64Array  `gorm:"type:integer[]" json:"trackIDs"`

	StartDate     time.Time `json:"startDate"`
	FinishDate    time.Time `json:"finishDate"`
	RegisterUntil time.Time `json:"registerUntil"`

	Sponsors pq.StringArray `gorm:"type:varchar[]" json:"sponsors"`
}

type FeedbackModel struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Author    string    `json:"author"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"createdAt"`
}

type NotificationModel struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Message   string    `json:"message"`
	OwnerID   int64     `json:"ownerId"`
	Status    string    `gorm:"default:'new'" json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type PersonalAchievementModel struct {
	ID          int64         `gorm:"primaryKey" json:"id"`
	Title       string        `gorm:"unique" json:"title"`
	Description string        `gorm:"unique" json:"description"`
	Image       string        `gorm:"unique" json:"image"`
	Key         string        `gorm:"unique" json:"key"`
	OwnerIDs    pq.Int64Array `gorm:"type:integer[];default:'{}'" json:"ownerIds"`
}

type PositionModel struct {
	ID     int64  `gorm:"primaryKey"`
	Name   string `gorm:"unique"`
	Author string `gorm:"not null;default:'admin'"`
}

type ProposalModel struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Type      string    `gorm:"not null" json:"type"`
	TeamID    int64     `gorm:"not null" json:"teamId"`
	OwnerID   int64     `gorm:"not null" json:"ownerId"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"createdAt"`
}

type SkillModel struct {
	ID     int64  `gorm:"primaryKey" json:"id"`
	Name   string `gorm:"unique; not null" json:"name"`
	Author string `gorm:"not null;default:'admin'"`
}

type TeamChatModel struct {
	ID         int64         `gorm:"primaryKey" json:"id"`
	TeamID     int64         `gorm:"unique" json:"teamId"`
	Title      string        `json:"title"`
	MemberIDs  pq.Int64Array `gorm:"type:integer[]" json:"membersId"`
	MessageIDs pq.Int64Array `gorm:"type:integer[]" json:"messagesId"`
}

type ChatMessageModel struct {
	ID         int64          `gorm:"primaryKey" json:"id"`
	TeamChatID int64          `json:"teamChatId"`
	Author     string         `json:"author"`
	Message    string         `gorm:"not null" json:"message"`
	Attachment pq.StringArray `gorm:"type:varchar[]" json:"attachment"`
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
	DeletedAt  time.Time      `json:"deletedAt"`
}

type TeamModel struct {
	ID              int64          `gorm:"primaryKey" json:"id"`
	Title           string         `gorm:"unique;not null;index" json:"title"`
	Description     string         `gorm:"not null" json:"description"`
	CaptainID       int64          `gorm:"unique; not null" json:"captain_id"`
	Image           datatypes.JSON `gorm:"type:jsonb;default:'{}'" json:"image"`
	MemberIDs       pq.Int64Array  `gorm:"type:integer[]" json:"members"`
	WantedPositions pq.StringArray `gorm:"type:varchar[];default:'{}'" json:"wantedPositions"`
	EventLocation   string         `gorm:"default:'г. Санкт-Петербург'" json:"eventLocation"`
	TeamChatID      int64          `json:"teamChatId"`
}

type TrackModel struct {
	ID                  int64         `gorm:"primaryKey" json:"id"`
	Title               string        `json:"title"`
	Description         string        `gorm:"not null" json:"description"`
	ParticipantsTeamIDs pq.Int64Array `gorm:"type:integer[];" json:"participantsTeamsIds"`
	EventID             int64         `json:"eventId"`
}

type UserModel struct {
	ID int64 `gorm:"primaryKey" json:"id"`

	Username string `gorm:"unique;index" json:"username"`
	Password string `json:"password"`

	Recovery datatypes.JSON `gorm:"type:jsonb;default:'{}'" json:"recovery"`

	Avatar datatypes.JSON `gorm:"type:jsonb;default:'{}'" json:"avatar"`

	Firstname  string `json:"firstname"`
	Middlename string `json:"middlename"`
	Lastname   string `json:"lastname"`

	Description string `json:"description"`

	Rank        string `json:"rank"`
	GroupNumber string `json:"group_number"`

	IsProfileConfirmed bool `gorm:"default:false" json:"is_profile_confirmed"`

	TeamID int64 `gorm:"default:0" json:"teamId"`

	RefreshToken string `json:"refresh_token"`

	Positions pq.StringArray `gorm:"type:varchar[];default:'{}'" json:"positions"`
	Skills    pq.StringArray `gorm:"type:varchar[];default:'{}'" json:"skills"`

	Roles pq.StringArray `gorm:"type:varchar[];default:'{\"user\",\"mailConfirmed\"}'" json:"roles"`

	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	MemberSince time.Time `json:"memberSince"`

	Settings string `json:"settings"`

	Portfolio datatypes.JSON `gorm:"type:jsonb;default:'[]'" json:"-"`

	Online     bool      `gorm:"default:false" json:"online"`
	LastOnline time.Time `json:"lastOnline"`
}

type RecoveryQuestionModel struct {
	ID       int64  `gorm:"primaryKey" json:"id"`
	Question string `gorm:"unique;not null" json:"question"`
}
