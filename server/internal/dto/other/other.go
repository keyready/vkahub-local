package other

var (
	USER_AVATARS_STORAGE     = "user-avatars"
	BUGS_STORAGE             = "bugs"
	EVENTS_STORAGE           = "events"
	CERTIFICATES_STORAGE     = "certificates"
	TEAM_IMAGES_STORAGE      = "team-images"
	CHAT_ATTACHMENTS_STORAGE = "attachments"
)

type NotificationData struct {
	Message string `query:"message"`
	OwnerId int    `query:"to"`
	From    int
}

type UpdateNotificationData struct {
	NotificationID int64 `json:"notificationId"`
}
