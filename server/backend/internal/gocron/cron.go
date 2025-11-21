package gocron

import (
	"backend/internal/models"
	"fmt"
	"gorm.io/gorm"
	"slices"
	"time"
)

func ClearNotifications(db *gorm.DB) func() {
	return func() {
		err := db.Exec("TRUNCATE TABLE notification_models;").Error
		if err != nil {
			panic(err)
		}
	}
}

func Banned(db *gorm.DB) func() {
	return func() {
		var lastEvent models.EventModel
		db.Last(&lastEvent)

		for _, teamId := range lastEvent.ParticipantsTeamsIds {

			deadlineDate := time.Now().AddDate(0, 0, 1)
			if !((lastEvent.FinishDate.Before(deadlineDate)) && (lastEvent.FinishDate.After(time.Now()))) {
				var bannedTeam models.TeamModel
				var captain models.UserModel
				db.Where("id = ?", teamId).First(&bannedTeam)

				createdAt, _ := time.Parse(time.RFC3339, time.Now().String())
				db.Create(&models.BanModel{
					Type:      "team",
					OwnerId:   teamId,
					Reason:    fmt.Sprintf("Несвоевременная сдача отчета о событии: %", lastEvent.Title),
					CreatedAt: createdAt,
				})

				db.Create(&models.BanModel{
					Type:      "user",
					OwnerId:   bannedTeam.CaptainId,
					Reason:    fmt.Sprintf("Несвоевременная сдача отчета о событии: % \n Бан как капитана команды %s", lastEvent.Title, bannedTeam.Title),
					CreatedAt: createdAt,
				})

				db.Where("id = ?", bannedTeam.CaptainId).First(&captain)
				if slices.Compare(captain.Roles, []string{"banned", "user"}) != 0 {
					captain.Roles = []string{"banned", "user"}
					db.Save(&captain)
				}
			}
		}
	}
}
