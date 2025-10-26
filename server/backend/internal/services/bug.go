package services

import (
	"backend/internal/dto/request"
	"backend/internal/models"
	"backend/internal/repositories"
)

type BugService interface {
	AddBug(addBug request.AddBugReq) (httpCode int, err error)
	FetchAllBugs(t string) (httpCode int, err error, bugs []models.BugModel)
	UpdateBug(updateBug request.UpdateBugReq) (httpCode int, err error)
}

type BugServiceImpl struct {
	bugRepository repositories.BugRepository
}

func NewBugServiceImpl(bugRepository repositories.BugRepository) BugService {
	return &BugServiceImpl{bugRepository: bugRepository}
}

func (b BugServiceImpl) UpdateBug(updateBug request.UpdateBugReq) (httpCode int, err error) {
	httpCode, err = b.bugRepository.UpdateBug(updateBug)
	return httpCode, err
}

func (b BugServiceImpl) AddBug(addBug request.AddBugReq) (httpCode int, err error) {
	httpCode, err = b.bugRepository.AddBug(addBug)
	return httpCode, err
}

func (b BugServiceImpl) FetchAllBugs(t string) (httpCode int, err error, bugs []models.BugModel) {
	httpCode, err, bugs = b.bugRepository.FetchAllBugs(t)
	return httpCode, err, bugs
}
