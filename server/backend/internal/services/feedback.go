package services

import (
	"backend/internal/dto/request"
	"backend/internal/models"
	"backend/internal/repositories"
)

type FeedbackService interface {
	AddFeed(addFeed request.AddFeedReq) (httpCode int, err error)
	FetchAllFeeds() (httpCode int, err error, feeds []models.FeedbackModel)
}

type FeedbackServiceImpl struct {
	feedRep repositories.FeedbackRepository
}

func NewFeedbackServiceImpl(repository repositories.FeedbackRepository) FeedbackService {
	return &FeedbackServiceImpl{feedRep: repository}
}

func (f FeedbackServiceImpl) AddFeed(addFeed request.AddFeedReq) (httpCode int, err error) {
	httpCode, err = f.feedRep.AddFeed(addFeed)
	return httpCode, err
}

func (f FeedbackServiceImpl) FetchAllFeeds() (httpCode int, err error, feeds []models.FeedbackModel) {
	httpCode, err, feeds = f.feedRep.FetchAllFeed()
	return httpCode, err, feeds
}
