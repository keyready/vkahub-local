package other

const (
	USER_AVATARS_STORAGE     = "/app/user-avatars"
	BUGS_STORAGE             = "/app/bugs"
	EVENTS_STORAGE           = "/app/events"
	REPORTS_STORAGE          = "/app/reports"
	CERTIFICATES_STORAGE     = "/app/certificates"
	TEAM_IMAGES_STORAGE      = "/app/team-images"
	CHAT_ATTACHMENTS_STORAGE = "/app/attachments"
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
