package services

import (
	"server/internal/forms/request"
	"server/internal/repositories"
)

type TeamChatService interface {
	DeleteMessage(delMsgForm request.DeleteMessageForm) (int, []string, error)
	EditMessage(editMsgForm request.EditMessageForm) (int, error)
	CreateMessage(createMessageForm request.WriteMessageForm) (int, error)
}

type TeamChatServiceImpl struct {
	teamChatRepository repositories.TeamChatRepository
}

func NewTeamChatServiceImpl(teamChatRepository repositories.TeamChatRepository) TeamChatService {
	return &TeamChatServiceImpl{teamChatRepository: teamChatRepository}
}

func (teamChatS TeamChatServiceImpl) CreateMessage(createMessageForm request.WriteMessageForm) (int, error) {
	httpCode, err := teamChatS.teamChatRepository.CreateMessage(createMessageForm)
	return httpCode, err
}

func (teamChatS TeamChatServiceImpl) DeleteMessage(delMsgForm request.DeleteMessageForm) (int, []string, error) {
	httpCode, attachmentMessages, err := teamChatS.teamChatRepository.DeleteMessage(delMsgForm)
	return httpCode, attachmentMessages, err
}

func (teamChatS TeamChatServiceImpl) EditMessage(editMsgForm request.EditMessageForm) (int, error) {
	httpCode, err := teamChatS.teamChatRepository.EditMessage(editMsgForm)
	return httpCode, err
}
