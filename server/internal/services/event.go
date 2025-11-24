package services

import (
	"server/internal/database"
	"server/internal/dto/request"
	"server/internal/repositories"
)

type EventService interface {
	FetchAllEvents(fetchAllEvents request.FetchAllEventsRequest) (int, error, []database.EventModel)
	FetchTracksEvent(eventId int64) (int, error, []database.TrackModel)
	FetchOneEvent(eventId int64) (httpCode int, err error, data *database.EventModel)
	AddEvent(addEventReq request.AddEventReq) (httpCode int, err error)
}

type EventServiceImpl struct {
	EventRepository repositories.EventRepository
}

func NewEventServiceImpl(eventRepository repositories.EventRepository) EventService {
	return &EventServiceImpl{EventRepository: eventRepository}
}
func (e EventServiceImpl) AddEvent(addEventReq request.AddEventReq) (httpCode int, err error) {
	httpCode, err = e.EventRepository.AddEvent(addEventReq)
	return httpCode, err
}

func (e EventServiceImpl) FetchOneEvent(eventId int64) (httpCode int, err error, data *database.EventModel) {
	httpCode, err, data = e.EventRepository.FetchOneEvent(eventId)
	return httpCode, err, data
}

func (e EventServiceImpl) FetchTracksEvent(eventId int64) (int, error, []database.TrackModel) {
	httpCode, err, data := e.EventRepository.FetchTracksEvent(eventId)
	return httpCode, err, data
}

func (e EventServiceImpl) FetchAllEvents(fetchAllEvents request.FetchAllEventsRequest) (int, error, []database.EventModel) {
	httpCode, err, data := e.EventRepository.FetchAllEvents(fetchAllEvents)
	return httpCode, err, data
}
