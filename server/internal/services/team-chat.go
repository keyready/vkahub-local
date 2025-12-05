package services

import (
	"server/internal/forms/request"
	"server/internal/repositories"
)

type TeamChatService interface {
	DeleteMessage(delMsgForm request.DeleteMessageForm) (int, []string, error)
	UpdateMessage(updMsgForm request.UpdateMessageForm) (int, error)
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

func (teamChatS TeamChatServiceImpl) UpdateMessage(updMsgForm request.UpdateMessageForm) (int, error) {
	httpCode, err := teamChatS.teamChatRepository.UpdateMessage(updMsgForm)
	return httpCode, err
}
