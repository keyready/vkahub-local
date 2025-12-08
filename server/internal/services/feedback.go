package services

import (
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/repositories"
)

type FeedbackService interface {
	AddFeedback(addFeedbackForm request.AddFeedbackForm) (int, error)
	GetFeedbacks() (int, []database.FeedbackModel, error)
}

type FeedbackServiceImpl struct {
	feedRep repositories.FeedbackRepository
}

func NewFeedbackServiceImpl(repository repositories.FeedbackRepository) FeedbackService {
	return &FeedbackServiceImpl{feedRep: repository}
}

func (f FeedbackServiceImpl) AddFeedback(addFeedbackForm request.AddFeedbackForm) (int, error) {
	httpCode, err := f.feedRep.AddFeedback(addFeedbackForm)
	return httpCode, err
}

func (f FeedbackServiceImpl) GetFeedbacks() (int, []database.FeedbackModel, error) {
	httpCode, feedbacks, err := f.feedRep.GetFeedbacks()
	return httpCode, feedbacks, err
}
