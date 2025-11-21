package repositories

import (
	"net/http"
	"server/internal/dto/request"
	"server/internal/models"
	"strconv"
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type TeamChatRepository interface {
	DeleteMessage(deleteMessage request.DeleteMessage) (httpCode int, err error, attachmentsMessage []string)
	UpdateMessage(updateMessage request.UpdateMessage) (httpCode int, err error)
	CreateMessage(createMessage request.CreateMessage) (httpCode int, err error)
}

type TeamChatRepositoryImpl struct {
	DB *gorm.DB
}

func NewTeamChatServiceImpl(db *gorm.DB) TeamChatRepository {
	return &TeamChatRepositoryImpl{DB: db}
}

func (tc TeamChatRepositoryImpl) CreateMessage(createMessage request.CreateMessage) (httpCode int, err error) {
	var author models.UserModel
	tc.DB.Where("username = ?", createMessage.Author).First(&author)

	var teamChatIdString string
	err = tc.DB.
		Model(&models.TeamChatModel{}).
		Select("id").
		Where("? = ANY (members_id)", author.ID).
		Scan(&teamChatIdString).
		Error
	if err != nil {
		return http.StatusInternalServerError, err
	}

	teamChatId, _ := strconv.ParseInt(teamChatIdString, 10, 64)
	createdAt, _ := time.Parse(time.RFC3339, time.Now().String())

	newMessage := models.ChatMessageModel{
		TeamChatId: teamChatId,
		Author:     createMessage.Author,
		Message:    createMessage.Message,
		Attachment: createMessage.AttachmentNames,
		CreatedAt:  createdAt,
	}
	err = tc.DB.Create(&newMessage).Error

	if err = tc.DB.
		Model(&models.TeamChatModel{}).
		Where("id = ?", teamChatId).
		Updates(map[string]interface{}{
			"messages_id": gorm.Expr("messages_id || ?", pq.Int64Array{newMessage.ID}),
		}).
		Error; err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusCreated, nil
}

func (tc TeamChatRepositoryImpl) DeleteMessage(deleteMessage request.DeleteMessage) (httpCode int, err error, attachmentsMessage []string) {
	var messages []models.ChatMessageModel
	err = tc.DB.
		Where("author = ?", deleteMessage.Author).
		Where("id = ANY(?)", deleteMessage.MessagesId).
		Delete(messages).
		Error
	if err != nil {
		return http.StatusNotFound, err, []string{}
	}
	return http.StatusOK, nil, []string{}
}

func (tc TeamChatRepositoryImpl) UpdateMessage(updateMessage request.UpdateMessage) (httpCode int, err error) {
	err = tc.DB.
		Model(&models.ChatMessageModel{}).
		Where("id = ? AND author = ?", updateMessage.MessageId, updateMessage.Author).
		Updates(models.ChatMessageModel{Message: updateMessage.NewBody}).
		Error
	if err != nil {
		return http.StatusInternalServerError, err
	}
	return http.StatusOK, nil
}
