package other

import "path/filepath"

const BASE_DIR = "/app/static"

var (
	USER_AVATARS_STORAGE     = filepath.Join(BASE_DIR, "user-avatars")
	BUGS_STORAGE             = filepath.Join(BASE_DIR, "bugs")
	EVENTS_STORAGE           = filepath.Join(BASE_DIR, "events")
	CERTIFICATES_STORAGE     = filepath.Join(BASE_DIR, "certificates")
	TEAM_IMAGES_STORAGE      = filepath.Join(BASE_DIR, "team-images")
	CHAT_ATTACHMENTS_STORAGE = filepath.Join(BASE_DIR, "attachments")
)

type RecoveryQuestionDTO struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

type NotificationData struct {
	Message string `query:"message"`
	OwnerId int    `query:"to"`
	From    int
}

type UpdateNotificationData struct {
	NotificationID int64 `json:"notificationId"`
}
