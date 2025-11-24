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
	OwnerId   int64     `gorm:"unique" json:"ownerId"`
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

type FeedbackModel struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Author    string    `json:"author"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"createdAt"`
}

type NotificationModel struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Message   string    `json:"message"`
	OwnerId   int64     `json:"ownerId"`
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
	OwnerIds    pq.Int64Array `gorm:"type:integer[];default:'{}'" json:"ownerIds"`
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
	OwnerId   int64     `gorm:"not null" json:"ownerId"`
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
	TeamId     int64         `gorm:"unique" json:"teamId"`
	Title      string        `json:"title"`
	MembersId  pq.Int64Array `gorm:"type:integer[]" json:"membersId"`
	MessagesId pq.Int64Array `gorm:"type:integer[]" json:"messagesId"`
}

type ChatMessageModel struct {
	ID         int64          `gorm:"primaryKey" json:"id"`
	TeamChatId int64          `json:"teamChatId"`
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
	CaptainId       int64          `gorm:"unique; not null" json:"captain_id"`
	Image           string         `json:"image"`
	MembersId       pq.Int64Array  `gorm:"type:integer[]" json:"members"`
	WantedPositions pq.StringArray `gorm:"type:varchar[]" json:"wantedPositions"`
	EventLocation   string         `gorm:"default:'г. Санкт-Петербург'" json:"eventLocation"`
	TeamChatId      int64          `json:"teamChatId"`
}

type TrackModel struct {
	ID                   int64         `gorm:"primaryKey" json:"id"`
	Title                string        `json:"title"`
	Description          string        `gorm:"not null" json:"description"`
	ParticipantsTeamsIds pq.Int64Array `gorm:"type:integer[];" json:"participantsTeamsIds"`
	EventId              int64         `json:"eventId"`
}

type UserModel struct {
	ID       int64  `gorm:"primaryKey" json:"id"`
	Username string `gorm:"unique;index" json:"username"`
	Password string `json:"password"`
	Avatar   string `json:"avatar"`

	Firstname  string `json:"firstname"`
	Middlename string `json:"middlename"`
	Lastname   string `json:"lastname"`

	Description string `json:"description"`

	Rank        string `json:"rank"`
	GroupNumber string `json:"group_number"`

	IsProfileConfirmed bool `gorm:"default:false" json:"is_profile_confirmed"`

	TeamId int64 `gorm:"default:0" json:"teamId"`

	RefreshToken string `json:"refresh_token"`

	Positions pq.StringArray `gorm:"type:varchar[];default:'{}'" json:"positions"`
	Skills    pq.StringArray `gorm:"type:varchar[];default:'{}'" json:"skills"`

	Roles pq.StringArray `gorm:"type:varchar[];default:'{\"user\",\"mailConfirmed\"}'" json:"roles"`

	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	MemberSince time.Time `json:"memberSince"`

	Portfolio datatypes.JSON `gorm:"type:jsonb;default:'[]'" json:"-"`

	LastOnline time.Time `json:"lastOnline"`
}
