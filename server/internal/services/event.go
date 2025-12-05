package services

import (
	"server/internal/cloud"
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/forms/response"
	"server/internal/repositories"
)

type EventService interface {
	GetEvents(getEventsForms request.GetEventsForm) (int, []*response.Event, error)
	GetTracksEvent(eventID int64) (int, []database.TrackModel, error)
	GetEvent(eventID int64) (int, *response.Event, error)
	RegisterEvent(registerEventForm request.RegisterEventForm) (int, error)
}

type EventServiceImpl struct {
	EventRepository repositories.EventRepository
	cloud           *cloud.Cloud
}

func NewEventServiceImpl(
	eventRepository repositories.EventRepository,
	cloud *cloud.Cloud,
) EventService {
	return &EventServiceImpl{
		EventRepository: eventRepository,
		cloud:           cloud,
	}
}
func (e EventServiceImpl) RegisterEvent(registerEventForm request.RegisterEventForm) (int, error) {
	httpCode, err := e.EventRepository.RegisterEvent(registerEventForm)
	return httpCode, err
}

func (e EventServiceImpl) GetEvent(eventID int64) (int, *response.Event, error) {
	httpCode, event, err := e.EventRepository.GetEvent(eventID)
	return httpCode, event, err
}

func (e EventServiceImpl) GetTracksEvent(eventID int64) (int, []database.TrackModel, error) {
	httpCode, tracks, err := e.EventRepository.GetTracksEvent(eventID)
	return httpCode, tracks, err
}

func (e EventServiceImpl) GetEvents(getEventsForms request.GetEventsForm) (int, []*response.Event, error) {
	httpCode, events, err := e.EventRepository.GetEvents(getEventsForms)
	return httpCode, events, err
}
