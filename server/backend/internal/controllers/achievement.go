package controllers

import (
	"backend/internal/dto/request"
	"backend/internal/services"
	"backend/pkg/app"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

type AchievementController struct {
	aService services.AchievementService
}

func NewAchievementController(aService services.AchievementService) *AchievementController {
	return &AchievementController{aService: aService}
}

func (ac *AchievementController) FetchAchievementsTeam(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var fetchAllAcReq request.FetchAllAcRequest

	userId := ctx.Query("userId")
	teamId := ctx.Query("teamId")

	if userId == "" {
		fetchAllAcReq.Owner = "team"
		id, _ := strconv.ParseInt(teamId, 10, 64)
		fetchAllAcReq.ValueId = id
	} else {
		fetchAllAcReq.Owner = "user"
		id, _ := strconv.ParseInt(userId, 10, 64)
		fetchAllAcReq.ValueId = id
	}

	httpCode, err, data := ac.aService.FetchAchievementsTeam(fetchAllAcReq)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, data)
}

func (ac *AchievementController) AddAchievement(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var addA request.AddAchievementReq

	bindErr := ctx.ShouldBindJSON(&addA)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, err := ac.aService.AddAchievement(addA)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}
