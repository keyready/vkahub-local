package services

import (
	"server/internal/cloud"
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/repositories"
)

type BugService interface {
	RegisterBug(regBugFrom request.RegisterBugForm) (int, error)
	GetBugs(statuBug string) (int, []database.BugModel, error)
	UpdateBug(updBugForm request.UpdateBugForm) (int, error)
}

type BugServiceImpl struct {
	bugRepository repositories.BugRepository
	cloud         *cloud.Cloud
}

func NewBugServiceImpl(
	bugRepository repositories.BugRepository,
	cloud *cloud.Cloud,
) BugService {
	return &BugServiceImpl{
		bugRepository: bugRepository,
		cloud:         cloud,
	}
}

func (b BugServiceImpl) UpdateBug(updBugForm request.UpdateBugForm) (int, error) {
	httpCode, err := b.bugRepository.UpdateBug(updBugForm)
	return httpCode, err
}

func (b BugServiceImpl) RegisterBug(regBugFrom request.RegisterBugForm) (int, error) {
	httpCode, err := b.bugRepository.RegisterBug(regBugFrom)
	return httpCode, err
}

func (b BugServiceImpl) GetBugs(statusBug string) (int, []database.BugModel, error) {
	httpCode, bugs, err := b.bugRepository.GetBugs(statusBug)
	return httpCode, bugs, err
}
