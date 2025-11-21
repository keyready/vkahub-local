package request

import (
	"mime/multipart"
	"time"
)

type SignUpRequest struct {
	Username    string                `form:"username"`
	Password    string                `form:"password"`
	Avatar      *multipart.FileHeader `form:"avatar"`
	ConfirmLink string
}

type LoginRequest struct {
	Username     string `binding:"required" json:"username"`
	Password     string `binding:"required" json:"password"`
	RefreshToken string `json:"refresh_token"`
}

type FetchAllMembersByParamsRequest struct {
	Lastname string `form:"lastname"`
	Username string `form:"username"`
	Wanted   string `form:"wanted"`
	IsMember string `form:"isMember"`
	Skills   string `form:"skills"`
}

type EditProfileInfoForm struct {
	ID int64 `form:"id"`

	Firstname  string `binding:"required" form:"firstname"`
	Middlename string `binding:"required" form:"middlename"`
	Lastname   string `binding:"required" form:"lastname"`

	Description string `form:"description"`

	Avatar string

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
	Title       string                `form:"title" binding:"required"`
	Description string                `form:"description" binding:"required"`
	CaptainID   int64                 `form:"captain_id" binding:"required"`
	Image       *multipart.FileHeader `form:"image" binding:"required"`
}

type FetchAllTeamsByParamsRequest struct {
	Title   string `form:"title"`
	Wanted  string `form:"wanted"`
	Members string `form:"members"`
}

type AddMembersInTeamRequest struct {
	MembersId []int64 `json:"membersId"`
	TeamId    int64   `json:"teamId"`
}

type DeleteMemberRequest struct {
	MemberId int64 `json:"memberId"`
	TeamId   int64 `json:"teamId"`
}

type TransferCaptainRightsRequest struct {
	OriginalCaptainId int64 `json:"originalCaptainId"`
	MemberId          int64 `json:"memberId"`
	TeamId            int64 `json:"teamId"`
	Owner             string
}

type CreateProposalRequest struct {
	Type    string  `json:"type"` //прошение или приглашение
	TeamId  int64   `json:"teamId"`
	UsersId []int64 `json:"usersId"` //invite - массив тех,кого пригласили, request - тот, кто просится
	Message string  `json:"message"`
}

type FetchProposalRequest struct {
	Type       string `json:"type"`
	KtoSmotrit string
}

type ApproveProposalRequest struct {
	ProposalId int64
	Username   string
}

type PartInTeam struct {
	MemberId int64  `json:"memberId"`
	TeamId   int64  `json:"teamId"`
	Message  string `json:"message"`
}

type AddTrackDto struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	EventId     int64  `json:"eventId"`
}

type PartTeamInTrackRequest struct {
	TeamId  int64 `json:"teamId"`
	TrackId int64 `json:"trackId"`
	EventId int64 `json:"eventId"`
}

type FetchOneTrackReq struct {
	TrackId int64 `json:"trackId"`
	EventId int64 `json:"eventId"`
}

type AddEventReq struct {
	Type             string                `form:"type"`
	Title            string                `form:"title"`
	Description      string                `form:"description"`
	ShortDescription string                `form:"shortDescription"`
	Image            *multipart.FileHeader `form:"image"`
	StartDate        time.Time             `form:"startDate"`
	FinishDate       time.Time             `form:"finishDate"`
	RegisterUntil    time.Time             `form:"registerUntil"`
	Sponsors         string                `form:"sponsors"`
}

type AddAchievementReq struct {
	TeamId  int64  `json:"teamId"`
	EventId int64  `json:"eventId"`
	Result  string `json:"result"`
}

type AddPortfolioForm struct {
	Certificates []*multipart.FileHeader `form:"certificates"`
	EventName    string                  `form:"eventName"`
	Place        string                  `form:"place"`
	Owner        string
}

type DeletePortfolioForm struct {
	CertificateName string `json:"certificateName"`
}

type FetchAllAcRequest struct {
	Owner   string `json:"owner"`
	ValueId int64  `json:"valueId"`
}

type AddSkillReq struct {
	Name   string `json:"name"`
	Author string
}

type AddPositionReq struct {
	Name   string `json:"name"`
	Author string
}

type AddBugReq struct {
	Description string `form:"description"`
	Produce     string `form:"produce"`
	Expected    string `form:"expected"`
	Additional  string `form:"additional"`
	Status      string `form:"status"`
	Author      string
}

type UpdateBugReq struct {
	BugID      int64  `json:"bugId"`
	StatusName string `json:"status"`
	Author     string
}

type AddFeedReq struct {
	Message string `json:"message"`
	Author  string
}

type FetchAllNotifications struct {
	UserId string `query:"userId"`
	Type   string `query:"type"`
}

type DeleteMessage struct {
	Author     string
	MessagesId int64 `json:"messagesId"`
}

type UpdateMessage struct {
	Author    string
	MessageId int64  `json:"messageId"`
	NewBody   string `json:"message"`
}

type FetchAllMessages struct {
	Member string
	TeamId int64
}

type CreateMessage struct {
	Message         string                  `form:"message"`
	Attachment      []*multipart.FileHeader `form:"attachment"`
	AttachmentNames []string
	Author          string
	TeamChatId      int64
}

type FetchAllEventsRequest struct {
	Type     string
	Username string
}
