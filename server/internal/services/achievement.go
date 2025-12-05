package services

import (
	"server/internal/forms/request"
	"server/internal/forms/response"
	"server/internal/repositories"
)

type AchievementService interface {
	AddAchievement(addAchivForm request.AddAchievementForm) (int, error)
	GetAchievementsTeam(getAchivsForm request.GetAchievementsForm) (int, error, []response.Achievement)
}

type AchievementServiceImpl struct {
	AcRepository repositories.AchievementRepository
}

func NewAcServiceImpl(aRepository repositories.AchievementRepository) AchievementService {
	return &AchievementServiceImpl{AcRepository: aRepository}
}

func (a AchievementServiceImpl) GetAchievementsTeam(getAchivsForm request.GetAchievementsForm) (int, error, []response.Achievement) {
	httpCode, err, achievements := a.AcRepository.GetAchievementsTeam(getAchivsForm)
	return httpCode, achievements, err
}

func (a AchievementServiceImpl) AddAchievement(addAchivForm request.AddAchievementForm) (int, error) {
	httpCode, err := a.AcRepository.AddAchievement(addAchivForm)
	return httpCode, err
}
