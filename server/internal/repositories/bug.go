package repositories

import (
	"fmt"
	"net/http"
	"server/internal/database"
	"server/internal/forms/request"
	"slices"

	"gorm.io/gorm"
)

type BugRepository interface {
	RegisterBug(regBugFrom request.RegisterBugForm) (int, error)
	GetBugs(statusBug string) (int, []database.BugModel, error)
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
		Where("id = ? AND author = ?", updBugForm.BugID, updBugForm.Author).
		Update(
			"status",
			updBugForm.Status,
		).Error
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to upd status bug: %v", err)
	}

	bugAchievement := database.PersonalAchievementModel{}
	b.DB.Where("key = ?", "bug").First(&bugAchievement)
	if !slices.Contains(bugAchievement.OwnerIDs, updBugForm.Author.ID) {
		bugAchievement.OwnerIDs = append(bugAchievement.OwnerIDs, updBugForm.Author.ID)
		b.DB.Save(&bugAchievement)
		b.DB.Create(&database.NotificationModel{
			OwnerID: updBugForm.Author.ID,
			Message: fmt.Sprintf(
				`
					Поздравляем, %s! Ваш репорт на первый найденный баг был принят и исправлен! 
					Вы получили новое достижение: %s \n 
					Спасибо, что помогаете нам в поддержании сервиса!
				`,
				updBugForm.Author.Username,
				bugAchievement.Title,
			),
		})
	}

	b.DB.Create(&database.NotificationModel{
		OwnerID: updBugForm.Author.ID,
		Message: fmt.Sprintf(
			`
				Поздравляем, %s! 
				Ваш репорт на найденный баг был принят и исправлен! \n 
				Спасибо, что помогаете нам в поддержании сервиса!
			`,
			updBugForm.Author.Username,
		),
	})

	return http.StatusOK, nil
}

func (b BugRepositoryImpl) RegisterBug(regBugFrom request.RegisterBugForm) (int, error) {
	newBug := database.BugModel{
		Description: regBugFrom.Description,
		Additional:  regBugFrom.Additional, //Примечания
		Expected:    regBugFrom.Expected,   //Ожидаемые действия
		Author:      regBugFrom.Author.Username,
		Produce:     regBugFrom.Produce, //Вывод
		Media:       regBugFrom.MediaNames,
	}
	err := b.DB.Create(&newBug).Error
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to register new bug: %v", err)
	}

	b.DB.Create(&database.NotificationModel{
		OwnerID: regBugFrom.Author.ID,
		Message: fmt.Sprintf(
			`
				Уважаемый %s! \n 
				Ваш баг прошел предварительную проверку и был предоставлен разработчикам на рассмотрение. \n 
				Спасибо, что помогаете сделать сервис лучше! \n
				Следите за обновлениями!
			`,
			regBugFrom.Author.Username,
		),
	})

	return http.StatusOK, nil
}

func (b BugRepositoryImpl) GetBugs(bugStatus string) (int, []database.BugModel, error) {
	bugModels := make([]database.BugModel, 0)
	if bugStatus != "" {
		b.DB.Where("status = ?", bugStatus).Find(&bugModels)
	}
	b.DB.Find(&bugModels)
	return http.StatusOK, bugModels, nil
}
