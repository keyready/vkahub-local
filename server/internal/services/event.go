package services

import (
	"context"
	"fmt"
	"net/http"
	"server/internal/cloud"
	"server/internal/database"
	"server/internal/dto/request"
	"server/internal/repositories"
	"time"
)

type EventService interface {
	FetchAllEvents(fetchAllEvents request.FetchAllEventsRequest) (int, error, []database.EventModel)
	FetchTracksEvent(eventId int64) (int, error, []database.TrackModel)
	FetchOneEvent(eventId int64) (httpCode int, err error, data *database.EventModel)
	AddEvent(addEventReq request.AddEventReq) (httpCode int, err error)
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
func (e EventServiceImpl) AddEvent(addEventReq request.AddEventReq) (httpCode int, err error) {
	httpCode, err = e.EventRepository.AddEvent(addEventReq)
	return httpCode, err
}

func (e EventServiceImpl) FetchOneEvent(eventId int64) (httpCode int, err error, data *database.EventModel) {
	httpCode, err, data = e.EventRepository.FetchOneEvent(eventId)

	url, err := e.cloud.Cloud.GetSharedURL(context.Background(), data.Image, time.Hour*2)
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to get share-link: %v", err), nil
	}

	data.Image = url

	return httpCode, err, data
}

func (e EventServiceImpl) FetchTracksEvent(eventId int64) (int, error, []database.TrackModel) {
	httpCode, err, data := e.EventRepository.FetchTracksEvent(eventId)
	return httpCode, err, data
}

func (e EventServiceImpl) FetchAllEvents(fetchAllEvents request.FetchAllEventsRequest) (int, error, []database.EventModel) {
	httpCode, err, data := e.EventRepository.FetchAllEvents(fetchAllEvents)

	for _, event := range data {
		url, err := e.cloud.Cloud.GetSharedURL(context.Background(), event.Image, time.Hour*2)
		if err != nil {
			return http.StatusInternalServerError, fmt.Errorf("failed to get share-link:%v ", err), nil
		}
		event.Image = url
	}

	return httpCode, err, data
}
