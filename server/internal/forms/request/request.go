package request

import (
	"time"
)

type SignUpForm struct {
	Username   string `form:"username"`
	Password   string `form:"password"`
	AvatarHash string `form:"hash"`
	Avatar     string
}

type LoginForm struct {
	Username string `binding:"required" json:"username"`
	Password string `binding:"required" json:"password"`
}

type GetMembersByParamsForm struct {
	Lastname string `form:"lastname"`
	Username string `form:"username"`
	Wanted   string `form:"wanted"`
	IsMember string `form:"isMember"`
	Skills   string `form:"skills"`
}

type EditProfileInfoForm struct {
	ID int64 `form:"id"`

	Firstname  string `form:"firstname"`
	Middlename string `form:"middlename"`
	Lastname   string `form:"lastname"`

	Description string `form:"description"`

	Avatar     string
	AvatarHash string `form:"hash"`

	Question string `form:"recoveryQuestion"`
	Answer   string `form:"recoveryAnswer"`

	Rank        string `form:"rank"`
	GroupNumber string `form:"group_number"`

	Skills    []string `form:"skills"`
	Positions []string `form:"positions"`

	Owner string
}

type EditTeamInfoForm struct {
	ID              int64  `form:"id"`
	Title           string `binding:"required" form:"title"`
	Description     string `binding:"required" form:"description"`
	Image           string
	EventLocation   string `form:"eventLocation"`
	WantedPositions string `form:"wantedPositions"`
}

type RegisterTeamForm struct {
	Title       string `form:"title" binding:"required"`
	Description string `form:"description" binding:"required"`
	CaptainID   int64  `form:"captain_id" binding:"required"`
	Image       string
	AvatarHash  string `form:"hash" binding:"required"`
}

type GetTeamsByParamsForm struct {
	Title   string `query:"title"`
	Wanted  string `query:"wanted"`
	Members string `query:"members"`
}

type AddMembersInTeamForm struct {
	MembersId []int64 `json:"membersId"`
	TeamId    int64   `json:"teamId"`
}

type DeleteMemberForm struct {
	MemberId int64 `json:"memberId"`
	TeamId   int64 `json:"teamId"`
}

type TransferCaptainRightsForm struct {
	OriginalCaptainId int64 `json:"originalCaptainId"`
	MemberId          int64 `json:"memberId"`
	TeamId            int64 `json:"teamId"`
	Owner             string
}

type CreateProposalForm struct {
	Type    string  `json:"type"` //прошение или приглашение
	TeamId  int64   `json:"teamId"`
	UsersId []int64 `json:"usersId"` //invite - массив тех,кого пригласили, request - тот, кто просится
	Message string  `json:"message"`
}

type GetProposalForm struct {
	Type     string `json:"type"`
	Observer string
}

type ApproveProposalForm struct {
	ProposalId int64
	Username   string
}

type PartInTeamForm struct {
	MemberId int64  `json:"memberId"`
	TeamId   int64  `json:"teamId"`
	Message  string `json:"message"`
}

type AddTrackForm struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	EventId     int64  `json:"eventId"`
}

type PartTeamInTrackForm struct {
	TeamId  int64 `json:"teamId"`
	TrackId int64 `json:"trackId"`
	EventId int64 `json:"eventId"`
}

type GetTrackForm struct {
	TrackId int64 `json:"trackId"`
	EventId int64 `json:"eventId"`
}

type RegisterEventForm struct {
	Type             string    `form:"type"`
	Title            string    `form:"title"`
	Description      string    `form:"description"`
	ShortDescription string    `form:"shortDescription"`
	Image            string    `form:"image"`
	StartDate        time.Time `form:"startDate"`
	FinishDate       time.Time `form:"finishDate"`
	RegisterUntil    time.Time `form:"registerUntil"`
	Sponsors         string    `form:"sponsors"`
	Hash             string    `form:"hash"`
}

type AddAchievementForm struct {
	TeamId  int64  `json:"teamId"`
	EventId int64  `json:"eventId"`
	Result  string `json:"result"`
}

type AddPortfolioForm struct {
	EventName    string `form:"eventName"`
	Place        string `form:"place"`
	Certificates []string
	Owner        string
}

type DeletePortfolioForm struct {
	CertificateName string `json:"certificateName"`
}

type GetAchievementsForm struct {
	Owner   string `json:"owner"`
	ValueId int64  `json:"valueId"`
}

type AddSkillForm struct {
	Name   string `json:"name"`
	Author string
}

type AddPositionForm struct {
	Name   string `json:"name"`
	Author string
}

type RegisterBugForm struct {
	Description string `form:"description"`
	Produce     string `form:"produce"`
	Expected    string `form:"expected"`
	Additional  string `form:"additional"`
	Status      string `form:"status"`
	MediaNames  []string
	Author      string
}

type UpdateBugForm struct {
	BugID      int64  `json:"bugId"`
	StatusName string `json:"status"`
	Author     string
}

type AddFeedbackForm struct {
	Message string `json:"message"`
	Author  string
}

type GetNotificationsForm struct {
	UserId string `query:"userId"`
	Type   string `query:"type"`
}

type UpdateNotificationForm struct {
	NotificationID int64 `json:"notificationId"`
}

type DeleteMessageForm struct {
	Author     string
	MessagesId int64 `json:"messagesId"`
}

type UpdateMessageForm struct {
	Author    string
	MessageId int64  `json:"messageId"`
	NewBody   string `json:"message"`
}

type GetMessagesForm struct {
	Member string
	TeamId int64
}

type WriteMessageForm struct {
	Message         string `form:"message"`
	AttachmentNames []string
	Author          string
	TeamChatId      int64
}

type GetEventsForm struct {
	Type     string
	Username string
}

type GetPersonalQuestionForm struct {
	Username string `json:"username"`
}

type ApproveRecoveryForm struct {
	Username string `json:"username"`
	Answer   string `json:"answer"`
}

type RecoveryPasswordForm struct {
	Username    string `json:"username"`
	NewPassword string `json:"new_password"`
}

type SetSettingsForm struct {
	Settings string `json:"settings"`
	Username string
}
