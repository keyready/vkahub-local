package controllers

import (
	"server/pkg/app"
	"net/http"
	"server/internal/dto/request"
	"server/internal/services"

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
	var addFeed request.AddFeedReq

	bindErr := ctx.ShouldBindJSON(&addFeed)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	addFeed.Author = ctx.GetString("username")

	httpCode, err := f.feedService.AddFeed(addFeed)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (f *FeedbackController) FetchAllFeedbacks(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	httpCode, err, feeds := f.feedService.FetchAllFeeds()
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, feeds)
}
