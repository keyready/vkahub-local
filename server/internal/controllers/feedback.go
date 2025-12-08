package controllers

import (
	"net/http"
	"server/internal/forms/request"
	"server/internal/services"
	"server/pkg/app"

	"github.com/gin-gonic/gin"
)

type FeedbackController struct {
	feedService services.FeedbackService
}

func NewFeedbackController(feedService services.FeedbackService) *FeedbackController {
	return &FeedbackController{feedService: feedService}
}

func (f *FeedbackController) AddFeedback(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	jsonForm := request.AddFeedbackForm{}

	bindErr := ctx.ShouldBindJSON(&jsonForm)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	jsonForm.Author.Username = ctx.GetString("username")

	httpCode, err := f.feedService.AddFeedback(jsonForm)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (f *FeedbackController) GetFeedbacks(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	httpCode, feedbacks, err := f.feedService.GetFeedbacks()
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, feedbacks)
}
