package repositories

import (
	"fmt"
	"net/http"
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/forms/response"

	"gorm.io/gorm"
)

type AchievementRepository interface {
	AddAchievement(addAchivForm request.AddAchievementForm) (int, error)
	GetAchievementsTeam(getAchivsForm request.GetAchievementsForm) (int, []response.Achievement, error)
}

type AchievementRepositoryImpl struct {
	Db *gorm.DB
}

func NewAchievementRepositoryImpl(db *gorm.DB) AchievementRepository {
	return &AchievementRepositoryImpl{Db: db}
}

func (a *AchievementRepositoryImpl) GetAchievementsTeam(getAchivsForm request.GetAchievementsForm) (int, []response.Achievement, error) {
	achievementModels := make([]database.AchievementModel, 0)
	achievements := make([]response.Achievement, 0)

	switch getAchivsForm.Owner {
	case "team":
		a.Db.Where("team_id = ? AND type = 'team'", getAchivsForm.ValueId).Find(&achievementModels)

		for _, achievement := range achievementModels {
			var event database.EventModel
			a.Db.Where("id = ?", achievement.EventID).First(&event)
			achiv := response.Achievement{
				Id:        achievement.ID,
				TeamId:    getAchivsForm.ValueId,
				EventId:   event.ID,
				EventName: event.Title,
				EventType: event.Type,
				Result:    achievement.Result,
			}
			achievements = append(achievements, achiv)
		}
	case "user":
		var user database.UserModel
		a.Db.First(&user, getAchivsForm.ValueId)
		var userTeam database.TeamModel
		a.Db.First(&userTeam, user.TeamId)
		var teamAch []database.AchievementModel
		a.Db.Where("team_id = ? AND type = 'user'", user.TeamId).Find(&teamAch)

		for _, achievement := range teamAch {
			var event database.EventModel
			a.Db.Where("id = ?", achievement.EventID).First(&event)
			res := response.Achievement{}
			res.Result = achievement.Result
			res.EventName = event.Title
			res.TeamTitle = userTeam.Title
			achievements = append(achievements, res)
		}
	}

	return http.StatusOK, achievements, nil
}

func (a *AchievementRepositoryImpl) AddAchievement(addAchivForm request.AddAchievementForm) (httpCode int, err error) {
	newA := database.AchievementModel{
		Type:    "team",
		TeamID:  addAchivForm.TeamId,
		EventID: addAchivForm.EventId,
		Result:  addAchivForm.Result,
	}
	a.Db.Create(&newA)

	var team database.TeamModel
	a.Db.Where("id = ?", addAchivForm.TeamId).First(&team)

	for _, userId := range team.MembersId {
		var user database.UserModel
		var event database.EventModel
		a.Db.Where("id = ?", addAchivForm.EventId).First(&event)
		a.Db.Where("id = ?", userId).First(&user)
		a.Db.Create(&database.AchievementModel{
			Type:    "user",
			TeamID:  userId,
			EventID: addAchivForm.EventId,
			Result:  addAchivForm.Result,
		})
		a.Db.Create(&database.NotificationModel{
			Message: fmt.Sprintf("Поздравляем, %s! Ваш результат - %s, в соревновании - %s", user.Username, addAchivForm.Result, event.Title),
			OwnerId: user.ID,
		})
	}

	return http.StatusOK, nil
}
