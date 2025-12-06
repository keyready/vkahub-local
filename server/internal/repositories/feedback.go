package repositories

import (
	"fmt"
	"net/http"
	"server/internal/database"
	"server/internal/forms/request"
	"slices"

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

	newFeed := database.FeedbackModel{
		Message: addFeedbackForm.Message,
		Author:  addFeedbackForm.Author.Username,
	}
	f.DB.Create(&newFeed)

	f.DB.Create(&database.NotificationModel{
		OwnerID: addFeedbackForm.Author.ID,
		Message: `
			Ваш фидбек отправлен! Спасибо что помогаете сделать сервис лучше!
		`,
	})

	achievement := database.PersonalAchievementModel{}
	f.DB.Where("key = ?", "feedback").First(&achievement)

	if !slices.Contains(achievement.OwnerIDs, addFeedbackForm.Author.ID) {
		achievement.OwnerIDs = append(achievement.OwnerIDs, addFeedbackForm.Author.ID)
		f.DB.Save(&achievement)

		f.DB.Create(&database.NotificationModel{
			OwnerID: addFeedbackForm.Author.ID,
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
