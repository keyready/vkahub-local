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
	updBug := database.BugModel{}
	b.DB.Where("id = ?", updBugForm.BugID).First(&updBug)

	updatedAt, _ := time.Parse(time.RFC3339, time.Now().String())

	updBug.Status = updBugForm.StatusName
	updBug.UpdatedAt = updatedAt
	b.DB.Save(&updBug)

	ownerAchievement := database.UserModel{}
	bugAchievement := database.PersonalAchievementModel{}
	b.DB.Where("username = ?", updBugForm.Author).First(&ownerAchievement)
	b.DB.Where("key = ?", "bug").First(&bugAchievement)

	if !slices.Contains(bugAchievement.OwnerIds, ownerAchievement.ID) {
		bugAchievement.OwnerIds = append(bugAchievement.OwnerIds, ownerAchievement.ID)
		b.DB.Save(&bugAchievement)
	 	author := database.UserModel{}
		b.DB.Where("username = ?", updBugForm.Author).First(&author)
		b.DB.Create(&database.NotificationModel{
			OwnerId: author.ID,
			Message: fmt.Sprintf(
				"Поздравляем, %s! Ваш репорт на первый найденный баг был принят и исправлен! Вы получили новое достижение: %s \n Спасибо, что помогаете нам в поддержании сервиса!",
				ownerAchievement.Username,
				bugAchievement.Title,
			),
		})
	}

	b.DB.Create(&database.NotificationModel{
		OwnerId: ownerAchievement.ID,
		Message: fmt.Sprintf(
			"Поздравляем, %s! Ваш репорт на найденный баг был принят и исправлен! \n Спасибо, что помогаете нам в поддержании сервиса!",
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
		OwnerId: author.ID,
		Message: fmt.Sprintf(
			"Уважаемый %s! \n Ваш баг прошел предварительную проверку и был предоставлен разработчикам на рассмотрение.\n Следите за обновлениями!",
			author.Username),
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
