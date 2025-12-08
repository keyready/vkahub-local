package gocron

import (
	"fmt"
	"server/internal/database"
	"slices"
	"time"

	"gorm.io/gorm"
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
		var lastEvent database.EventModel
		db.Last(&lastEvent)

		for _, teamId := range lastEvent.ParticipantsTeamIDs {

			deadlineDate := time.Now().AddDate(0, 0, 1)
			if !((lastEvent.FinishDate.Before(deadlineDate)) && (lastEvent.FinishDate.After(time.Now()))) {
				var bannedTeam database.TeamModel
				var captain database.UserModel
				db.Where("id = ?", teamId).First(&bannedTeam)

				createdAt, _ := time.Parse(time.RFC3339, time.Now().String())
				db.Create(&database.BanModel{
					Type:    "team",
					OwnerID: teamId,
					Reason: fmt.Sprintf(
						`
							Несвоевременная сдача отчета о событии: %s
						`,
						lastEvent.Title,
					),
					CreatedAt: createdAt,
				})

				db.Create(&database.BanModel{
					Type:    "user",
					OwnerID: bannedTeam.CaptainID,
					Reason: fmt.Sprintf(
						`
							Несвоевременная сдача отчета о событии: %s \n 
							Бан капитана команды %s
						`,
						lastEvent.Title,
						bannedTeam.Title,
					),
					CreatedAt: createdAt,
				})

				db.Where("id = ?", bannedTeam.CaptainID).First(&captain)
				if slices.Compare(captain.Roles, []string{"banned", "user"}) != 0 {
					captain.Roles = []string{"banned", "user"}
					db.Save(&captain)
				}
			}
		}
	}
}
