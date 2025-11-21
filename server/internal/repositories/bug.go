package repositories

import (
	"fmt"
	"net/http"
	"server/internal/dto/request"
	"server/internal/models"
	"slices"
	"time"

	"gorm.io/gorm"
)

type BugRepository interface {
	AddBug(addBug request.AddBugReq, mediaNames []string) (httpCode int, err error)
	FetchAllBugs(t string) (httpCode int, err error, bugs []models.BugModel)
	UpdateBug(updateBug request.UpdateBugReq) (httpCode int, err error)
}

type BugRepositoryImpl struct {
	DB *gorm.DB
}

func NewBugRepositoryImpl(db *gorm.DB) BugRepository {
	return &BugRepositoryImpl{DB: db}
}

func (b BugRepositoryImpl) UpdateBug(updateBugReq request.UpdateBugReq) (httpCode int, err error) {
	var updateBug models.BugModel
	b.DB.Where("id = ?", updateBugReq.BugID).First(&updateBug)

	updatedAt, _ := time.Parse(time.RFC3339, time.Now().String())

	updateBug.Status = updateBugReq.StatusName
	updateBug.UpdatedAt = updatedAt
	b.DB.Save(&updateBug)

	var ownerAchievement models.UserModel
	var bugAchievement models.PersonalAchievementModel
	b.DB.Where("username = ?", updateBugReq.Author).First(&ownerAchievement)
	b.DB.Where("key = ?", "bug").First(&bugAchievement)

	if !slices.Contains(bugAchievement.OwnerIds, ownerAchievement.ID) {
		bugAchievement.OwnerIds = append(bugAchievement.OwnerIds, ownerAchievement.ID)
		b.DB.Save(&bugAchievement)
		var author models.UserModel
		b.DB.Where("username = ?", updateBugReq.Author).First(&author)
		b.DB.Create(&models.NotificationModel{
			OwnerId: author.ID,
			Message: fmt.Sprintf(
				"Поздравляем, %s! Ваш репорт на первый найденный баг был принят и исправлен! Вы получили новое достижение: %s \n Спасибо, что помогаете нам в поддержании сервиса!",
				ownerAchievement.Username,
				bugAchievement.Title,
			),
		})
	}

	b.DB.Create(&models.NotificationModel{
		OwnerId: ownerAchievement.ID,
		Message: fmt.Sprintf(
			"Поздравляем, %s! Ваш репорт на найденный баг был принят и исправлен! \n Спасибо, что помогаете нам в поддержании сервиса!",
			ownerAchievement.Username,
		),
	})

	return http.StatusOK, nil
}

func (b BugRepositoryImpl) AddBug(addBug request.AddBugReq, mediaNames []string) (httpCode int, err error) {
	var allBugs []models.BugModel
	b.DB.Find(&allBugs)

	var author models.UserModel
	b.DB.Where("username = ?", addBug.Author).First(&author)

	createdAt, _ := time.Parse(time.RFC3339, time.Now().String())
	newBug := models.BugModel{
		Description: addBug.Description,
		Additional:  addBug.Additional, //Примечания
		Expected:    addBug.Expected,   //Ожидаемые действия
		Author:      addBug.Author,
		Produce:     addBug.Produce, //Вывод
		Media:       mediaNames,
		CreatedAt:   createdAt,
	}
	b.DB.Create(&newBug)

	b.DB.Create(&models.NotificationModel{
		OwnerId: author.ID,
		Message: fmt.Sprintf(
			"Уважаемый %s! \n Ваш баг прошел предварительную проверку и был предоставлен разработчикам на рассмотрение.\n Следите за обновлениями!",
			author.Username),
	})

	return http.StatusOK, err
}

func (b BugRepositoryImpl) FetchAllBugs(t string) (httpCode int, err error, bugs []models.BugModel) {
	switch t {
	case "":
		b.DB.Where("status = ?", t).Find(&bugs)
	default:
		b.DB.Find(&bugs)
	}
	return http.StatusOK, nil, bugs
}
