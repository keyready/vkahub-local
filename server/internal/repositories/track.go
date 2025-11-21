package repositories

import (
	"fmt"
	"net/http"
	"server/internal/dto/request"
	"server/internal/models"

	"gorm.io/gorm"
)

type TrackRepository interface {
	AddTrack(addTrack request.AddTrackDto) (httpCode int, err error)
	PartTeamInTrack(partTeamInTrack request.PartTeamInTrackRequest) (httpCode int, err error)
	FetchOneTrack(fetchOneTrack request.FetchOneTrackReq) (httpCode int, err error, data models.TrackModel)
}

type TrackRepositoryImpl struct {
	Db *gorm.DB
}

func NewTrackRepositoryImpl(db *gorm.DB) TrackRepository {
	return &TrackRepositoryImpl{Db: db}
}

func (t *TrackRepositoryImpl) FetchOneTrack(fetchOneTrack request.FetchOneTrackReq) (httpCode int, findTrackErr error, track models.TrackModel) {
	if findTrackErr = t.Db.First(&track, fetchOneTrack.TrackId).Where("event_id = ?", fetchOneTrack.EventId).Error; findTrackErr != nil {
		return http.StatusNotFound, findTrackErr, models.TrackModel{ID: 0}
	}
	return http.StatusOK, nil, track
}

func (t *TrackRepositoryImpl) PartTeamInTrack(pTeamInTrack request.PartTeamInTrackRequest) (httpCode int, err error) {
	var track models.TrackModel
	var event models.EventModel

	if pTeamInTrack.TrackId != 0 {
		t.Db.Where("id = ?", pTeamInTrack.TrackId).First(&track)
		t.Db.Where("id = ?", track.EventId).First(&event)
		track.ParticipantsTeamsIds = append(track.ParticipantsTeamsIds, pTeamInTrack.TeamId)
		t.Db.Save(&track)
		event.ParticipantsTeamsIds = append(event.ParticipantsTeamsIds, pTeamInTrack.TeamId)
		t.Db.Save(&event)
		for _, teamId := range event.ParticipantsTeamsIds {
			var team models.TeamModel
			t.Db.Where("id = ?", teamId).First(&team)
			for _, memberId := range team.MembersId {
				t.Db.Create(&models.NotificationModel{
					OwnerId: memberId,
					Message: fmt.Sprintf(
						"Ваша команда %s присоеденилась к эвенту %s на трек %s",
						team.Title,
						event.Title,
						track.Title,
					),
				})
			}
		}
	} else {
		t.Db.Where("id = ?", pTeamInTrack.EventId).First(&event)
		event.ParticipantsTeamsIds = append(event.ParticipantsTeamsIds, pTeamInTrack.TeamId)
		t.Db.Save(&event)
		for _, teamId := range event.ParticipantsTeamsIds {
			var team models.TeamModel
			t.Db.Where("id = ?", teamId).First(&team)
			for _, userId := range team.MembersId {
				t.Db.Create(&models.NotificationModel{
					OwnerId: userId,
					Message: fmt.Sprintf(
						"Ваша команда %s присоеденилась к эвенту %s",
						team.Title,
						event.Title,
					),
				})
			}
		}
	}

	return http.StatusOK, nil
}

func (t *TrackRepositoryImpl) AddTrack(addTrack request.AddTrackDto) (httpCode int, err error) {
	var event models.EventModel
	newTrack := models.TrackModel{
		Title:                addTrack.Title,
		Description:          addTrack.Description,
		EventId:              addTrack.EventId,
		ParticipantsTeamsIds: []int64{},
	}
	if addTrackErr := t.Db.Create(&newTrack).Error; addTrackErr != nil {
		return http.StatusBadRequest, addTrackErr
	}

	if findEventErr := t.Db.First(&event, addTrack.EventId).Error; findEventErr != nil {
		return http.StatusNotFound, findEventErr
	}
	event.TracksId = append(event.TracksId, newTrack.ID)
	t.Db.Save(&event)

	for _, teamId := range event.ParticipantsTeamsIds {
		var team models.TeamModel
		t.Db.Where("id = ?", teamId).First(&team)
		for _, memberId := range team.MembersId {
			t.Db.Create(&models.NotificationModel{
				OwnerId: memberId,
				Message: fmt.Sprintf("Анонсирован новый трек %s на событие %s", newTrack.Title, event.Title),
			})
		}
	}

	return http.StatusCreated, nil
}
