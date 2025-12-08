package repositories

import (
	"fmt"
	"net/http"
	"server/internal/database"
	"server/internal/forms/request"

	"gorm.io/gorm"
)

type TrackRepository interface {
	AddTrack(addTrackForm request.AddTrackForm) (int, error)
	PartTeamInTrack(partTeamInTrackForm request.PartTeamInTrackForm) (int, error)
	GetTrack(getTrackForm request.GetTrackForm) (int, database.TrackModel, error)
}

type TrackRepositoryImpl struct {
	Db *gorm.DB
}

func NewTrackRepositoryImpl(db *gorm.DB) TrackRepository {
	return &TrackRepositoryImpl{Db: db}
}

func (t *TrackRepositoryImpl) GetTrack(getTrackForm request.GetTrackForm) (int, database.TrackModel, error) {
	track := database.TrackModel{}
	if err := t.Db.
		First(&track, getTrackForm.TrackID).
		Where("event_id = ?", getTrackForm.EventID).
		Error; err != nil {
		return http.StatusNotFound, database.TrackModel{}, err
	}

	return http.StatusOK, track, nil
}

func (t *TrackRepositoryImpl) PartTeamInTrack(partTeamInTrackForm request.PartTeamInTrackForm) (int, error) {
	var track database.TrackModel
	var event database.EventModel

	if partTeamInTrackForm.TrackId != 0 {
		t.Db.Where("id = ?", partTeamInTrackForm.TrackId).First(&track)
		t.Db.Where("id = ?", track.EventID).First(&event)
		track.ParticipantsTeamIDs = append(track.ParticipantsTeamIDs, partTeamInTrackForm.TeamId)
		t.Db.Save(&track)
		event.ParticipantsTeamIDs = append(event.ParticipantsTeamIDs, partTeamInTrackForm.TeamId)
		t.Db.Save(&event)
		for _, teamId := range event.ParticipantsTeamIDs {
			var team database.TeamModel
			t.Db.Where("id = ?", teamId).First(&team)
			for _, memberId := range team.MemberIDs {
				t.Db.Create(&database.NotificationModel{
					OwnerID: memberId,
					Message: fmt.Sprintf(
						`
							Ваша команда %s присоединилась к событию %s \n
							Трек: %s
						`,
						team.Title,
						event.Title,
						track.Title,
					),
				})
			}
		}
	} else {
		t.Db.Where("id = ?", partTeamInTrackForm.EventId).First(&event)
		event.ParticipantsTeamIDs = append(event.ParticipantsTeamIDs, partTeamInTrackForm.TeamId)
		t.Db.Save(&event)
		for _, teamId := range event.ParticipantsTeamIDs {
			var team database.TeamModel
			t.Db.Where("id = ?", teamId).First(&team)
			for _, userId := range team.MemberIDs {
				t.Db.Create(&database.NotificationModel{
					OwnerID: userId,
					Message: fmt.Sprintf(
						`
							Ваша команда %s присоеденилась к эвенту %s
						`,
						team.Title,
						event.Title,
					),
				})
			}
		}
	}

	return http.StatusOK, nil
}

func (t *TrackRepositoryImpl) AddTrack(addTrackForm request.AddTrackForm) (int, error) {
	var event database.EventModel
	newTrack := database.TrackModel{
		Title:               addTrackForm.Title,
		Description:         addTrackForm.Description,
		EventID:             addTrackForm.EventID,
		ParticipantsTeamIDs: []int64{},
	}
	if addTrackErr := t.Db.Create(&newTrack).Error; addTrackErr != nil {
		return http.StatusBadRequest, addTrackErr
	}

	if findEventErr := t.Db.First(&event, addTrackForm.EventID).Error; findEventErr != nil {
		return http.StatusNotFound, findEventErr
	}
	event.TrackIDs = append(event.TrackIDs, newTrack.ID)
	t.Db.Save(&event)

	for _, teamId := range event.ParticipantsTeamIDs {
		var team database.TeamModel
		t.Db.Where("id = ?", teamId).First(&team)
		for _, memberId := range team.MemberIDs {
			t.Db.Create(&database.NotificationModel{
				OwnerID: memberId,
				Message: fmt.Sprintf(
					`
						Анонсирован новый трек %s в событии %s. \n
						Спеши зарегистрироваться и прими участие.
					`,
					newTrack.Title,
					event.Title,
				),
			})
		}
	}

	return http.StatusCreated, nil
}
