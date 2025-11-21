package other

import (
	"github.com/golang-jwt/jwt/v5"
)

type JwtClaims struct {
	jwt.RegisteredClaims
	Username string `json:"username"`
	Mail     string `json:"mail"`
}

type ConfirmCode struct {
	Code string `json:"code"`
}

type RecoveryPassword struct {
	Password      string `json:"password"`
	RecoveryToken string `json:"recovery_token"`
}

type NotificationData struct {
	Message string `query:"message"`
	OwnerId int    `query:"to"`
	From    int
}

type UpdateNotificationData struct {
	NotificationID int64 `json:"notificationId"`
}
