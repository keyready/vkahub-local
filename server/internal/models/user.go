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

type PortfolioFile struct {
	Name      string `json:"name"`
	EventName string `json:"eventName"`
	Place     string `json:"place"`
	Url       string `json:"url"`
	Type      string `json:"type"`
}
