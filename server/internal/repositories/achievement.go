package repositories

import (
	"fmt"
	"net/http"
	"server/internal/database"
	"server/internal/dto/request"
	"server/internal/dto/response"

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
	var achievements []database.AchievementModel

	switch fetchAllAc.Owner {
	case "team":
		a.Db.Where("team_id = ? AND type = 'team'", fetchAllAc.ValueId).Find(&achievements)

		for _, achievement := range achievements {
			var event database.EventModel
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
		var user database.UserModel
		a.Db.First(&user, fetchAllAc.ValueId)
		var userTeam database.TeamModel
		a.Db.First(&userTeam, user.TeamId)
		var teamAch []database.AchievementModel
		a.Db.Where("team_id = ? AND type = 'user'", user.TeamId).Find(&teamAch)

		for _, achievement := range teamAch {
			var event database.EventModel
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
	newA := database.AchievementModel{
		Type:    "team",
		TeamID:  addAReq.TeamId,
		EventID: addAReq.EventId,
		Result:  addAReq.Result,
	}
	a.Db.Create(&newA)

	var team database.TeamModel
	a.Db.Where("id = ?", addAReq.TeamId).First(&team)

	for _, userId := range team.MembersId {
		var user database.UserModel
		var event database.EventModel
		a.Db.Where("id = ?", addAReq.EventId).First(&event)
		a.Db.Where("id = ?", userId).First(&user)
		a.Db.Create(&database.AchievementModel{
			Type:    "user",
			TeamID:  userId,
			EventID: addAReq.EventId,
			Result:  addAReq.Result,
		})
		a.Db.Create(&database.NotificationModel{
			Message: fmt.Sprintf("Поздравляем, %s! Ваш результат - %s, в соревновании - %s", user.Username, addAReq.Result, event.Title),
			OwnerId: user.ID,
		})
	}

	return http.StatusOK, nil
}
