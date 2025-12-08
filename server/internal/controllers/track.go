package controllers

import (
	"net/http"
	"server/internal/forms/request"
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
	jsonForm := request.PartTeamInTrackForm{}

	bindErr := ctx.ShouldBindJSON(&jsonForm)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, err := tc.trackService.PartTeamInTrack(jsonForm)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (tc *TrackController) GetTrack(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	form := request.GetTrackForm{}

	httpCode, track, err := tc.trackService.GetTrack(form)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, track)
}

func (tc *TrackController) AddTrack(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	jsonForm := request.AddTrackForm{}

	bindErr := ctx.ShouldBindJSON(&jsonForm)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, err := tc.trackService.AddTrack(jsonForm)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}
