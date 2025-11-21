package repositories

import (
	"fmt"
	"net/http"
	"server/internal/dto/request"
	"server/internal/models"
	"strings"
	"time"

	"gorm.io/gorm"
)

type EventRepository interface {
	FetchAllEvents(fetchAllEvents request.FetchAllEventsRequest) (httpCode int, err error, events []models.EventModel)
	FetchTracksEvent(eventId int64) (httpCode int, err error, tracks []models.TrackModel)
	FetchOneEvent(eventId int64) (httpCode int, err error, data *models.EventModel)
	AddEvent(addEventReq request.AddEventReq) (httpCode int, err error)
}

type EventRepositoryImpl struct {
	Db *gorm.DB
}

func NewEventRepositoryImpl(Db *gorm.DB) EventRepository {
	return &EventRepositoryImpl{Db: Db}
}

func (e *EventRepositoryImpl) AddEvent(addEventReq request.AddEventReq) (httpCode int, err error) {
	sponsors := strings.Split(addEventReq.Sponsors, ",")

	newEvent := models.EventModel{
		Type:             addEventReq.Type,
		Title:            addEventReq.Title,
		Description:      addEventReq.Description,
		ShortDescription: addEventReq.ShortDescription,
		StartDate:        addEventReq.StartDate,
		FinishDate:       addEventReq.FinishDate,
		Image:            addEventReq.Image.Filename,
		RegisterUntil:    addEventReq.RegisterUntil,
		Sponsors:         sponsors,
	}

	dbErr := e.Db.Create(&newEvent).Error
	if dbErr != nil {
		return http.StatusBadRequest, fmt.Errorf("DB create event error: %v", dbErr)
	}

	var users []models.UserModel
	e.Db.Where("is_profile_confirmed = ?", true).
		Where("is_mail_confirmed = ?", true).
		Find(&users)

	go func() {
		for _, user := range users {
			e.Db.Create(&models.NotificationModel{
				OwnerId: user.ID,
				Message: fmt.Sprintf("Анонсированно новое событие %s", addEventReq.Title),
			})
			e.Db.Create(&models.NotificationModel{
				OwnerId: user.ID,
				Message: fmt.Sprintf(
					"Уважаемый %s! Анонсировано новое событие %s. \n Даты проведения: с %s по %s \n Успейте пройти регистрацию и принять участие!",
					user.Username,
					addEventReq.Title,
					addEventReq.StartDate.Format("2006-01-02"),
					addEventReq.FinishDate.Format("2006-01-02"),
				),
			})
		}
	}()
	return http.StatusOK, nil
}

func (e *EventRepositoryImpl) FetchOneEvent(eventId int64) (httpCode int, err error, data *models.EventModel) {
	var event models.EventModel
	if err = e.Db.First(&event, eventId).Error; err != nil {
		return http.StatusNotFound, err, nil
	}
	return http.StatusOK, nil, &event
}

func (e *EventRepositoryImpl) FetchTracksEvent(eventId int64) (httpCode int, err error, tracks []models.TrackModel) {
	var event models.EventModel
	var eventTracks []models.TrackModel

	e.Db.Where("id = ?", eventId).First(&event)

	for _, id := range event.TracksId {
		var track models.TrackModel
		e.Db.Where("id = ?", id).First(&track)
		eventTracks = append(eventTracks, track)
	}

	return http.StatusOK, nil, eventTracks
}

func (e *EventRepositoryImpl) FetchAllEvents(fetchAllEvents request.FetchAllEventsRequest) (httpCode int, err error, events []models.EventModel) {
	switch fetchAllEvents.Type {
	case "all":
		e.Db.Find(&events)
	case "old":
		var team models.TeamModel
		var user models.UserModel
		e.Db.Where("username = ?", fetchAllEvents.Username).First(&user)
		e.Db.First(&team, user.TeamId)
		currentTime := time.Now().Format(time.RFC3339)
		e.Db.Where("finish_date < ?", currentTime).
			Where("? = ANY(participants_teams_ids)", user.TeamId).
			Find(&events)

		var oldEvents []models.EventModel
		for _, event := range events {
			var teamAchievement models.AchievementModel
			e.Db.Where("type = 'team' AND event_id = ?", event.ID).First(&teamAchievement)
			if teamAchievement.Result == "" {
				oldEvents = append(oldEvents, event)
			}
		}
		events = oldEvents
	default:
		e.Db.Where("type = ?", fetchAllEvents.Type).Find(&events)
	}

	return http.StatusOK, nil, events
}
