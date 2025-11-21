package controllers

import (
	"net/http"
	"server/internal/dto/request"
	"server/internal/services"
	"server/pkg/app"

	"github.com/gin-gonic/gin"
)

type TrackController struct {
	trackService services.TrackService
}

func NewTrackController(trackService services.TrackService) *TrackController {
	return &TrackController{trackService: trackService}
}

func (tc *TrackController) PartTeamInTrack(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var partTeamInTrack request.PartTeamInTrackRequest

	bindErr := ctx.ShouldBindJSON(&partTeamInTrack)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, err := tc.trackService.PartTeamInTrack(partTeamInTrack)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (tc *TrackController) FetchOneTrack(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var fetchOneTrack request.FetchOneTrackReq

	httpCode, err, data := tc.trackService.FetchOneTrack(fetchOneTrack)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, data)
}

func (tc *TrackController) AddTrack(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var addTrack request.AddTrackDto

	bindErr := ctx.ShouldBindJSON(&addTrack)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, err := tc.trackService.AddTrack(addTrack)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}
