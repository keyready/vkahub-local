package models

import (
	"time"

	"gorm.io/datatypes"

	"github.com/lib/pq"
)

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
	TgUsername  string `json:"tg_username"`

	IsProfileConfirmed bool `gorm:"default:false" json:"is_profile_confirmed"`
	IsMailConfirmed    bool `gorm:"default:false" json:"is_mail_confirmed"`

	TeamId    int64          `gorm:"default:0" json:"teamId"`
	Positions pq.StringArray `gorm:"type:varchar[]" json:"positions"`

	RefreshToken string `json:"refresh_token"`
	ConfirmLink  string `json:"confirm_link"`

	Skills pq.StringArray `gorm:"type:varchar[]" json:"skills"`

	Roles pq.StringArray `gorm:"type:varchar[]" json:"roles"`

	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	MemberSince time.Time `json:"memberSince"`

	Portfolio datatypes.JSON `gorm:"type:jsonb" json:"-"`

	LastOnline time.Time `json:"lastOnline"`
}

type PortfolioFile struct {
	Name      string `json:"name"`
	EventName string `json:"eventName"`
	Place     string `json:"place"`
	Url       string `json:"url"`
	Type      string `json:"type"`
}
