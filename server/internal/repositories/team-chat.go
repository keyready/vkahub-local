package repositories

import (
	"net/http"
	"server/internal/database"
	"server/internal/forms/request"
	"strconv"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type TeamChatRepository interface {
	DeleteMessage(delMsgForm request.DeleteMessageForm) (int, []string, error)
	EditMessage(editMsgForm request.EditMessageForm) (int, error)
	CreateMessage(createMessageForm request.WriteMessageForm) (int, error)
}

type TeamChatRepositoryImpl struct {
	DB *gorm.DB
}

func NewTeamChatServiceImpl(db *gorm.DB) TeamChatRepository {
	return &TeamChatRepositoryImpl{DB: db}
}

func (tc TeamChatRepositoryImpl) CreateMessage(createMessageForm request.WriteMessageForm) (int, error) {
	var author database.UserModel
	tc.DB.Where("username = ?", createMessageForm.Author).First(&author)

	var teamChatIdString string
	err := tc.DB.
		Model(&database.TeamChatModel{}).
		Select("id").
		Where("? = ANY (members_id)", author.ID).
		Scan(&teamChatIdString).
		Error
	if err != nil {
		return http.StatusInternalServerError, err
	}

	teamChatId, _ := strconv.ParseInt(teamChatIdString, 10, 64)

	newMessage := database.ChatMessageModel{
		TeamChatID: teamChatId,
		Author:     createMessageForm.Author.Username,
		Message:    createMessageForm.Message,
		Attachment: createMessageForm.AttachmentNames,
	}
	_ = tc.DB.Create(&newMessage).Error

	if err = tc.DB.
		Model(&database.TeamChatModel{}).
		Where("id = ?", teamChatId).
		Updates(map[string]interface{}{
			"messages_id": gorm.Expr("messages_id || ?", pq.Int64Array{newMessage.ID}),
		}).
		Error; err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusCreated, nil
}

func (tc TeamChatRepositoryImpl) DeleteMessage(delMsgForm request.DeleteMessageForm) (int, []string, error) {
	messages := make([]database.ChatMessageModel, 0)
	err := tc.DB.
		Where("id = ? AND author = ?", delMsgForm.MessageID, delMsgForm.Author).
		Delete(messages).
		Error
	if err != nil {
		return http.StatusNotFound, nil, nil
	}
	return http.StatusOK, nil, nil
}

func (tc TeamChatRepositoryImpl) EditMessage(editMsgForm request.EditMessageForm) (int, error) {
	err := tc.DB.
		Model(&database.ChatMessageModel{}).
		Where("id = ? AND author = ?", editMsgForm.MessageID, editMsgForm.Author.Username).
		Update("message", editMsgForm.NewBody).
		Error
	if err != nil {
		return http.StatusInternalServerError, err
	}
	return http.StatusOK, nil
}
