package dto

const (
	USER_AVATARS_FOLDER      = "user-avatars"
	BUGS_FOLDER              = "bugs"
	EVENTS_FOLDER            = "events"
	CERTIFICATES_FOLDER      = "certificates"
	TEAM_IMAGES_FOLDER       = "team-images"
	CHAT_ATTACHMENTS_FOLDER  = "attachments"
	REPORTS_STORAGE          = "/app/static/reports"
	TEMPLATE_REPORT_FILENAME = "report_template.docx"
)

type AuthorMetaData struct {
	ID       int64
	Username string
}
