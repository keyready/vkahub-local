package repositories

import (
	"fmt"
	"net/http"
	"server/internal/database"
	"server/internal/forms/request"
	"slices"
	"time"

	"gorm.io/gorm"
)

type BugRepository interface {
	RegisterBug(regBugFrom request.RegisterBugForm) (int, error)
	GetBugs(typeBug string) (int, []database.BugModel, error)
	UpdateBug(updBugForm request.UpdateBugForm) (int, error)
}

type BugRepositoryImpl struct {
	DB *gorm.DB
}

func NewBugRepositoryImpl(db *gorm.DB) BugRepository {
	return &BugRepositoryImpl{DB: db}
}

func (b BugRepositoryImpl) UpdateBug(updBugForm request.UpdateBugForm) (int, error) {
	err := b.DB.
		Where("id = ?", updBugForm.BugID).
		Update(
			"status",
			updBugForm.StatusName,
		).Error
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to upd status bug: %v", err)
	}

	ownerAchievement := database.UserModel{}
	bugAchievement := database.PersonalAchievementModel{}
	b.DB.Where("username = ?", updBugForm.Author).First(&ownerAchievement)
	b.DB.Where("key = ?", "bug").First(&bugAchievement)
	if !slices.Contains(bugAchievement.OwnerIDs, ownerAchievement.ID) {
		bugAchievement.OwnerIDs = append(bugAchievement.OwnerIDs, ownerAchievement.ID)
		b.DB.Save(&bugAchievement)
		author := database.UserModel{}
		b.DB.Where("username = ?", updBugForm.Author).First(&author)
		b.DB.Create(&database.NotificationModel{
			OwnerID: author.ID,
			Message: fmt.Sprintf(
				`
					Поздравляем, %s! Ваш репорт на первый найденный баг был принят и исправлен! 
					Вы получили новое достижение: %s \n 
					Спасибо, что помогаете нам в поддержании сервиса!
				`,
				ownerAchievement.Username,
				bugAchievement.Title,
			),
		})
	}

	b.DB.Create(&database.NotificationModel{
		OwnerID: ownerAchievement.ID,
		Message: fmt.Sprintf(
			`
				Поздравляем, %s! 
				Ваш репорт на найденный баг был принят и исправлен! \n 
				Спасибо, что помогаете нам в поддержании сервиса!
			`,
			ownerAchievement.Username,
		),
	})

	return http.StatusOK, nil
}

func (b BugRepositoryImpl) RegisterBug(regBugFrom request.RegisterBugForm) (int, error) {
	allBugs := make([]database.BugModel, 0)
	b.DB.Find(&allBugs)

	author := database.UserModel{}
	b.DB.Where("username = ?", regBugFrom.Author).First(&author)

	createdAt, _ := time.Parse(time.RFC3339, time.Now().String())
	newBug := database.BugModel{
		Description: regBugFrom.Description,
		Additional:  regBugFrom.Additional, //Примечания
		Expected:    regBugFrom.Expected,   //Ожидаемые действия
		Author:      regBugFrom.Author,
		Produce:     regBugFrom.Produce, //Вывод
		Media:       regBugFrom.MediaNames,
		CreatedAt:   createdAt,
	}
	b.DB.Create(&newBug)

	b.DB.Create(&database.NotificationModel{
		OwnerID: author.ID,
		Message: fmt.Sprintf(
			`
				Уважаемый %s! \n 
				Ваш баг прошел предварительную проверку и был предоставлен разработчикам на рассмотрение. \n 
				Спасибо, что помогаете сделать сервис лучше! \n
				Следите за обновлениями!
			`,
			author.Username,
		),
	})

	return http.StatusOK, nil
}

func (b BugRepositoryImpl) GetBugs(typeBug string) (int, []database.BugModel, error) {
	bugModels := make([]database.BugModel, 0)

	switch typeBug {
	case "":
		b.DB.Where("status = ?", typeBug).Find(&bugModels)
	default:
		b.DB.Find(&bugModels)
	}
	return http.StatusOK, bugModels, nil
}
