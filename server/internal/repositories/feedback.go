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

type FeedbackRepository interface {
	AddFeedback(addFeedbackForm request.AddFeedbackForm) (int, error)
	GetFeedbacks() (int, []database.FeedbackModel, error)
}

type FeedbackRepositoryImpl struct {
	DB *gorm.DB
}

func NewFeedbackImpl(db *gorm.DB) FeedbackRepository {
	return &FeedbackRepositoryImpl{DB: db}
}

func (f FeedbackRepositoryImpl) AddFeedback(addFeedbackForm request.AddFeedbackForm) (int, error) {
	owner := database.UserModel{}
	f.DB.Where("username = ?", addFeedbackForm.Author).First(&owner)

	createdAt, _ := time.Parse(time.RFC3339, time.Now().String())
	newFeed := database.FeedbackModel{
		Message:   addFeedbackForm.Message,
		Author:    addFeedbackForm.Author,
		CreatedAt: createdAt,
	}
	f.DB.Create(&newFeed)

	f.DB.Create(&database.NotificationModel{
		OwnerID: owner.ID,
		Message: `
			Ваш фидбек отправлен! Спасибо что помогаете сделать наш сервис лучше!
		`,
	})

	var achievement database.PersonalAchievementModel
	var ownerAchievement database.UserModel
	f.DB.Where("key = ?", "feedback").First(&achievement)
	f.DB.Where("username = ?", addFeedbackForm.Author).First(&ownerAchievement)

	if !slices.Contains(achievement.OwnerIDs, ownerAchievement.ID) {
		achievement.OwnerIDs = append(achievement.OwnerIDs, ownerAchievement.ID)
		f.DB.Save(&achievement)
		f.DB.Create(&database.NotificationModel{
			OwnerID: ownerAchievement.ID,
			Message: fmt.Sprintf(
				`
					Ваш первый фидбек отправлен! \n 
					Вы получили достижение: %s
				`,
				achievement.Title,
			),
		})
	}

	return http.StatusCreated, nil
}

func (f FeedbackRepositoryImpl) GetFeedbacks() (int, []database.FeedbackModel, error) {
	feedbacks := make([]database.FeedbackModel, 0)
	f.DB.Find(&feedbacks)
	return http.StatusOK, feedbacks, nil
}
