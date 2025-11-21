package v1

import (
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewAchievementRoutes(r *gin.Engine, ac *controllers.AchievementController) {
	acRoutes := r.Group("/api/achievements")

	acRoutes.Use(middleware.AuthMiddleware())

	acRoutes.POST("/create", ac.AddAchievement)
	acRoutes.GET("", ac.FetchAchievementsTeam)
}
