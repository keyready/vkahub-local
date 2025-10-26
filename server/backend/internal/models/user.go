package models

import (
	"github.com/lib/pq"
	"time"
)

type UserModel struct {
	ID       int64  `gorm:"primaryKey" json:"id"`
	Username string `gorm:"unique;index" json:"username"`
	Password string `json:"password"`
	Mail     string `json:"mail"`
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

	LastOnline time.Time `json:"lastOnline"`
}
