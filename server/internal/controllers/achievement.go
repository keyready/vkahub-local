package controllers

import (
	"net/http"
	"server/internal/dto/request"
	"server/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AchievementController struct {
	aService services.AchievementService
}

func NewAchievementController(aService services.AchievementService) *AchievementController {
	return &AchievementController{aService: aService}
}

func (ac *AchievementController) FetchAchievementsTeam(gCtx *gin.Context) {
	form := request.FetchAllAcRequest{}

	userId := gCtx.Query("userId")
	teamId := gCtx.Query("teamId")

	switch {
	case userId == "":
		form.Owner = "team"
		valueID, _ := strconv.Atoi(teamId)
		form.ValueId = int64(valueID)
	default:
		form.Owner = "user"
		valueID, _ := strconv.Atoi(userId)
		form.ValueId = int64(valueID)
	}

	httpCode, err, achievements := ac.aService.FetchAchievementsTeam(form)
	if err != nil {
		gCtx.AbortWithError(
			httpCode,
			err,
		)

		gCtx.JSON(
			httpCode,
			gin.H{"error": err.Error()},
		)

		return
	}

	gCtx.JSON(httpCode, achievements)
}

func (ac *AchievementController) AddAchievement(gCtx *gin.Context) {
	jsonForm := request.AddAchievementReq{}

	if bindErr := gCtx.ShouldBindJSON(&jsonForm); bindErr != nil {
		gCtx.AbortWithError(
			http.StatusBadRequest,
			bindErr,
		)

		gCtx.JSON(
			http.StatusBadRequest,
			gin.H{"error": bindErr.Error()},
		)

		return
	}

	httpCode, err := ac.aService.AddAchievement(jsonForm)
	if err != nil {
		gCtx.AbortWithError(
			httpCode,
			err,
		)

		gCtx.JSON(httpCode, gin.H{"error": err.Error()})

		return
	}

	gCtx.JSON(httpCode, gin.H{})
}
