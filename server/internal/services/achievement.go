package services

import (
	"server/internal/dto/request"
	"server/internal/dto/response"
	"server/internal/repositories"
)

type AchievementService interface {
	AddAchievement(addAchReq request.AddAchievementReq) (httpCode int, err error)
	FetchAchievementsTeam(fetchAllAc request.FetchAllAcRequest) (httpCode int, err error, data []response.FetchAllAchievementResponse)
}

type AchievementServiceImpl struct {
	AcRepository repositories.AchievementRepository
}

func NewAcServiceImpl(aRepository repositories.AchievementRepository) AchievementService {
	return &AchievementServiceImpl{AcRepository: aRepository}
}

func (a AchievementServiceImpl) FetchAchievementsTeam(fetchAllAc request.FetchAllAcRequest) (httpCode int, err error, data []response.FetchAllAchievementResponse) {
	httpCode, err, data = a.AcRepository.FetchAchievementsTeam(fetchAllAc)
	return httpCode, err, data
}

func (a AchievementServiceImpl) AddAchievement(addAchReq request.AddAchievementReq) (httpCode int, err error) {
	httpCode, err = a.AcRepository.AddAchievement(addAchReq)
	return httpCode, err
}
