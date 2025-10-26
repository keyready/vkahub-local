package services

import (
	"backend/internal/dto/request"
	"backend/internal/models"
	"backend/internal/repositories"
)

type EventService interface {
	FetchAllEvents(fetchAllEvents request.FetchAllEventsRequest) (int, error, []models.EventModel)
	FetchTracksEvent(eventId int64) (int, error, []models.TrackModel)
	FetchOneEvent(eventId int64) (httpCode int, err error, data *models.EventModel)
	ParseInfoEvent(url string) (httpCode int, err error, data string)
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

func (e EventServiceImpl) ParseInfoEvent(url string) (int, error, string) {
	httpCode, err, data := e.EventRepository.ParseInfoEvent(url)
	return httpCode, err, data
}

func (e EventServiceImpl) FetchOneEvent(eventId int64) (httpCode int, err error, data *models.EventModel) {
	httpCode, err, data = e.EventRepository.FetchOneEvent(eventId)
	return httpCode, err, data
}

func (e EventServiceImpl) FetchTracksEvent(eventId int64) (int, error, []models.TrackModel) {
	httpCode, err, data := e.EventRepository.FetchTracksEvent(eventId)
	return httpCode, err, data
}

func (e EventServiceImpl) FetchAllEvents(fetchAllEvents request.FetchAllEventsRequest) (int, error, []models.EventModel) {
	httpCode, err, data := e.EventRepository.FetchAllEvents(fetchAllEvents)
	return httpCode, err, data
}
