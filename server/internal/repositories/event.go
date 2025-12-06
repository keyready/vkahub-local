package repositories

import (
	"fmt"
	"net/http"
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/forms/response"
	"server/internal/mapper"
	"server/internal/utils"
	"strings"
	"time"

	"gorm.io/gorm"
)

type EventRepository interface {
	GetEvents(getEventsForms request.GetEventsForm) (int, []*response.Event, error)
	GetTracksEvent(eventID int64) (int, []database.TrackModel, error)
	GetEvent(eventID int64) (int, *response.Event, error)
	RegisterEvent(registerEventForm request.RegisterEventForm) (int, error)
}

type EventRepositoryImpl struct {
	Db *gorm.DB
}

func NewEventRepositoryImpl(Db *gorm.DB) EventRepository {
	return &EventRepositoryImpl{Db: Db}
}

func (e *EventRepositoryImpl) RegisterEvent(registerEventForm request.RegisterEventForm) (int, error) {
	imageObj := database.ImageObj{
		Image: registerEventForm.Image,
		Hash:  registerEventForm.Hash,
	}
	imageJSON, _ := utils.ToJSON(imageObj)

	newEvent := database.EventModel{
		Type:             registerEventForm.Type,
		Title:            registerEventForm.Title,
		Description:      registerEventForm.Description,
		ShortDescription: registerEventForm.ShortDescription,
		StartDate:        registerEventForm.StartDate,
		FinishDate:       registerEventForm.FinishDate,
		Image:            imageJSON,
		RegisterUntil:    registerEventForm.RegisterUntil,
		Sponsors:         strings.Split(registerEventForm.Sponsors, ","),
	}

	dbErr := e.Db.Create(&newEvent).Error
	if dbErr != nil {
		return http.StatusBadRequest, fmt.Errorf("failed to register event: %v", dbErr)
	}

	users := make([]database.UserModel, 0)
	e.Db.Where("is_profile_confirmed = ?", true).Find(&users)

	// TODO - НУЖЕН БРОКЕР СООБЩЕНИЙ go func() {
	// 	for _, user := range users {
	// 		e.Db.Create(&database.NotificationModel{
	// 			OwnerID: user.ID,
	// 			Message: fmt.Sprintf(
	// 				`
	// 					Анонсированно новое событие -  %s
	// 					Спешите и регистрируйтесь!
	// 				`,
	// 				registerEventForm.Title,
	// 			),
	// 		})
	// 		e.Db.Create(&database.NotificationModel{
	// 			OwnerID: user.ID,
	// 			Message: fmt.Sprintf(
	// 				`
	// 					Уважаемый %s!
	// 					Анонсировано новое событие %s. \n
	// 					Даты проведения: с %s по %s \n
	// 					Успейте пройти регистрацию и принять участие!
	// 				`,
	// 				user.Username,
	// 				registerEventForm.Title,
	// 				registerEventForm.StartDate.Format("2006-01-02"),
	// 				registerEventForm.FinishDate.Format("2006-01-02"),
	// 			),
	// 		})
	// 	}
	// }()

	return http.StatusOK, nil
}

func (e *EventRepositoryImpl) GetEvent(eventID int64) (int, *response.Event, error) {
	event := database.EventModel{}
	if err := e.Db.First(&event, eventID).Error; err != nil {
		return http.StatusNotFound, nil, err
	}

	eventResponse, _ := mapper.EventModelToEventResponse(event)

	return http.StatusOK, eventResponse, nil
}

func (e *EventRepositoryImpl) GetTracksEvent(eventID int64) (int, []database.TrackModel, error) {
	eventTracks := make([]database.TrackModel, 0)
	err := e.Db.Where("event_id = ?", eventID).
		Find(&eventTracks).Error
	if err != nil {
		return http.StatusInsufficientStorage, nil, fmt.Errorf("failed to select event tracks: %v", err)
	}

	return http.StatusOK, eventTracks, nil
}

func (e *EventRepositoryImpl) GetEvents(getEventsForms request.GetEventsForm) (int, []*response.Event, error) {
	eventModels := make([]database.EventModel, 0)
	eventsResponse := make([]*response.Event, 0)

	switch getEventsForms.Type {
	case "all":
		e.Db.Find(&eventModels)
	case "old":
		var (
			team database.TeamModel
			user database.UserModel
		)
		e.Db.Where("username = ?", getEventsForms.Username).First(&user)
		e.Db.First(&team, user.TeamID)
		currentTime := time.Now().Format(time.RFC3339)
		e.Db.Where("finish_date < ?", currentTime).
			Where("? = ANY(participants_teams_ids)", user.TeamID).
			Find(&eventModels)

		oldEvents := make([]database.EventModel, 0)
		for _, event := range eventModels {
			var teamAchievement database.AchievementModel
			e.Db.Where("type = 'team' AND event_id = ?", event.ID).First(&teamAchievement)
			if teamAchievement.Result == "" {
				oldEvents = append(oldEvents, event)
			}
		}
		eventModels = oldEvents
	default:
		e.Db.Where("type = ?", getEventsForms.Type).Find(&eventModels)
	}

	for _, eventModel := range eventModels {
		eventResponse, _ := mapper.EventModelToEventResponse(eventModel)
		eventsResponse = append(eventsResponse, eventResponse)
	}

	return http.StatusOK, eventsResponse, nil
}
