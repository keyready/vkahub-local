package other

import "path/filepath"

const BASE_DIR = "/app/static"

var (
	USER_AVATARS_STORAGE     = filepath.Join(BASE_DIR, "user-avatars")
	BUGS_STORAGE             = filepath.Join(BASE_DIR, "bugs")
	EVENTS_STORAGE           = filepath.Join(BASE_DIR, "events")
	REPORTS_STORAGE          = filepath.Join(BASE_DIR, "reports")
	CERTIFICATES_STORAGE     = filepath.Join(BASE_DIR, "certificates")
	TEAM_IMAGES_STORAGE      = filepath.Join(BASE_DIR, "team-images")
	CHAT_ATTACHMENTS_STORAGE = filepath.Join(BASE_DIR, "attachments")
)

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
