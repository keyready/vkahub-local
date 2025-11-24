package services

import (
	"server/internal/database"
	"server/internal/dto/request"
	"server/internal/repositories"
)

type BugService interface {
	AddBug(addBug request.AddBugReq, mediaNames []string) (httpCode int, err error)
	FetchAllBugs(t string) (httpCode int, err error, bugs []database.BugModel)
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

func (b BugServiceImpl) AddBug(addBug request.AddBugReq, mediaNames []string) (httpCode int, err error) {
	httpCode, err = b.bugRepository.AddBug(addBug, mediaNames)
	return httpCode, err
}

func (b BugServiceImpl) FetchAllBugs(t string) (httpCode int, err error, bugs []database.BugModel) {
	httpCode, err, bugs = b.bugRepository.FetchAllBugs(t)
	return httpCode, err, bugs
}
