package repositories

import (
	"fmt"
	"net/http"
	"server/internal/dto/request"
	"server/internal/dto/response"
	"server/internal/models"

	"gorm.io/gorm"
)

type AchievementRepository interface {
	AddAchievement(addAReq request.AddAchievementReq) (httpCode int, err error)
	FetchAchievementsTeam(fetchAllAc request.FetchAllAcRequest) (httpCode int, err error, data []response.FetchAllAchievementResponse)
}

type AchievementRepositoryImpl struct {
	Db *gorm.DB
}

func NewAchievementRepositoryImpl(db *gorm.DB) AchievementRepository {
	return &AchievementRepositoryImpl{Db: db}
}

func (a *AchievementRepositoryImpl) FetchAchievementsTeam(fetchAllAc request.FetchAllAcRequest) (httpCode int, err error, data []response.FetchAllAchievementResponse) {
	var achievements []models.AchievementModel

	switch fetchAllAc.Owner {
	case "team":
		a.Db.Where("team_id = ? AND type = 'team'", fetchAllAc.ValueId).Find(&achievements)

		for _, achievement := range achievements {
			var event models.EventModel
			a.Db.Where("id = ?", achievement.EventID).First(&event)
			res := response.FetchAllAchievementResponse{
				Id:        achievement.ID,
				TeamId:    fetchAllAc.ValueId,
				EventId:   event.ID,
				EventName: event.Title,
				EventType: event.Type,
				Result:    achievement.Result,
			}
			data = append(data, res)
		}
	case "user":
		var user models.UserModel
		a.Db.First(&user, fetchAllAc.ValueId)
		var userTeam models.TeamModel
		a.Db.First(&userTeam, user.TeamId)
		var teamAch []models.AchievementModel
		a.Db.Where("team_id = ? AND type = 'user'", user.TeamId).Find(&teamAch)

		for _, achievement := range teamAch {
			var event models.EventModel
			a.Db.Where("id = ?", achievement.EventID).First(&event)
			res := response.FetchAllAchievementResponse{}
			res.Result = achievement.Result
			res.EventName = event.Title
			res.TeamTitle = userTeam.Title
			data = append(data, res)
		}
	}

	return http.StatusOK, nil, data
}

func (a *AchievementRepositoryImpl) AddAchievement(addAReq request.AddAchievementReq) (httpCode int, err error) {
	newA := models.AchievementModel{
		Type:    "team",
		TeamID:  addAReq.TeamId,
		EventID: addAReq.EventId,
		Result:  addAReq.Result,
	}
	a.Db.Create(&newA)

	var team models.TeamModel
	a.Db.Where("id = ?", addAReq.TeamId).First(&team)

	for _, userId := range team.MembersId {
		var user models.UserModel
		var event models.EventModel
		a.Db.Where("id = ?", addAReq.EventId).First(&event)
		a.Db.Where("id = ?", userId).First(&user)
		a.Db.Create(&models.AchievementModel{
			Type:    "user",
			TeamID:  userId,
			EventID: addAReq.EventId,
			Result:  addAReq.Result,
		})
		a.Db.Create(&models.NotificationModel{
			Message: fmt.Sprintf("Поздравляем, %s! Ваш результат - %s, в соревновании - %s", user.Username, addAReq.Result, event.Title),
			OwnerId: user.ID,
		})
	}

	return http.StatusOK, nil
}
