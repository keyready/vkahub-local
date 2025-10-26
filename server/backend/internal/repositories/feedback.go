package repositories

import (
	"backend/internal/dto/request"
	"backend/internal/models"
	"fmt"
	"gorm.io/gorm"
	"net/http"
	"slices"
	"time"
)

type FeedbackRepository interface {
	AddFeed(addFeed request.AddFeedReq) (httpCode int, err error)
	FetchAllFeed() (httpCode int, err error, feeds []models.FeedbackModel)
}

type FeedbackRepositoryImpl struct {
	DB *gorm.DB
}

func NewFeedbackImpl(db *gorm.DB) FeedbackRepository {
	return &FeedbackRepositoryImpl{DB: db}
}

func (f FeedbackRepositoryImpl) AddFeed(addFeed request.AddFeedReq) (httpCode int, err error) {
	var owner models.UserModel
	f.DB.Where("username = ?", addFeed.Author).First(&owner)

	createdAt, _ := time.Parse(time.RFC3339, time.Now().String())
	newFeed := models.FeedbackModel{
		Message:   addFeed.Message,
		Author:    addFeed.Author,
		CreatedAt: createdAt,
	}
	f.DB.Create(&newFeed)

	f.DB.Create(&models.NotificationModel{
		OwnerId: owner.ID,
		Message: fmt.Sprintf("Ваш фидбек отправлен! Спасибо что помогаете сделать наш сервис лучше!"),
	})

	var achievement models.PersonalAchievementModel
	var ownerAchievement models.UserModel
	f.DB.Where("key = ?", "feedback").First(&achievement)
	f.DB.Where("username = ?", addFeed.Author).First(&ownerAchievement)

	if !slices.Contains(achievement.OwnerIds, ownerAchievement.ID) {
		achievement.OwnerIds = append(achievement.OwnerIds, ownerAchievement.ID)
		f.DB.Save(&achievement)
		f.DB.Create(&models.NotificationModel{
			OwnerId: ownerAchievement.ID,
			Message: fmt.Sprintf("Ваш первый фидбек отправлен! \n Вы получили достижение: %s", achievement.Title),
		})
	}

	return http.StatusCreated, nil
}

func (f FeedbackRepositoryImpl) FetchAllFeed() (httpCode int, err error, feeds []models.FeedbackModel) {
	f.DB.Find(&feeds)
	return http.StatusOK, nil, feeds
}
