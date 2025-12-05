package controllers

import (
	"net/http"
	"server/internal/forms/request"
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

func (ac *AchievementController) GetAchievementsTeam(gCtx *gin.Context) {
	formData := request.GetAchievementsForm{}

	userId := gCtx.Query("userId")
	teamId := gCtx.Query("teamId")

	switch {
	case userId == "":
		formData.Owner = "team"
		valueID, _ := strconv.Atoi(teamId)
		formData.ValueId = int64(valueID)
	default:
		formData.Owner = "user"
		valueID, _ := strconv.Atoi(userId)
		formData.ValueId = int64(valueID)
	}

	httpCode, err, achievements := ac.aService.GetAchievementsTeam(formData)
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
	jsonForm := request.AddAchievementForm{}

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
