package services

import (
	"server/internal/dto/request"
	"server/internal/repositories"
)

type TeamChatService interface {
	DeleteMessage(deleteMessage request.DeleteMessage) (httpCode int, err error, attachmentsMessage []string)
	UpdateMessage(updateMessage request.UpdateMessage) (httpCode int, err error)
	CreateMessage(createMessage request.WriteMessageForm) (httpCode int, err error)
}

type TeamChatServiceImpl struct {
	teamChatRepository repositories.TeamChatRepository
}

func NewTeamChatServiceImpl(teamChatRepository repositories.TeamChatRepository) TeamChatService {
	return &TeamChatServiceImpl{teamChatRepository: teamChatRepository}
}

func (teamChatS TeamChatServiceImpl) CreateMessage(createMessage request.WriteMessageForm) (httpCode int, err error) {
	httpCode, err = teamChatS.teamChatRepository.CreateMessage(createMessage)
	return httpCode, err
}

func (teamChatS TeamChatServiceImpl) DeleteMessage(deleteMessage request.DeleteMessage) (httpCode int, err error, attachmentsMessage []string) {
	httpCode, err, attachmentsMessage = teamChatS.teamChatRepository.DeleteMessage(deleteMessage)
	return httpCode, err, attachmentsMessage
}

func (teamChatS TeamChatServiceImpl) UpdateMessage(updateMessage request.UpdateMessage) (httpCode int, err error) {
	httpCode, err = teamChatS.teamChatRepository.UpdateMessage(updateMessage)
	return httpCode, err
}
